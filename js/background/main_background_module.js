
	function main_background_module () {

		var _app = null;

		var _state = {

		};

		var _priv = {

			url_to_record_id: ( url ) => {

				try {

					return url.split( "lightning/" )[ 1 ].split( "/" )[ 2 ]

				} catch ( e ) {

					return null;

				};

			},

			url_2_to_record_id: ( url ) => {

				try {

					var woId=url.split( "/" )[ 3 ];
					if(woId.indexOf('?')>=0){
						woId=woId.substring(0,woId.indexOf('?'));
					}
					return woId;

				} catch ( e ) {

					return null;

				};

			},

			exec_notify: ( autoclose, notification_name, title, message ) => {

				return new Promise( ( resolve ) => {

					chrome.notifications.create( notification_name, {

						type: 'basic',
						iconUrl: '/img/favicon.png',
						title: title,
						message: message

					}, async ( notification_id ) => {

						resolve( notification_id );

						if ( autoclose ) {

							await _app.x.util.wait( 2000 );

							chrome.notifications.clear( notification_id );

						};

					});

				});

			},

			notify: async ( notification_name, data ) => {

				if ( notification_name === "no_records_removed" ) {

					_priv.exec_notify( true, notification_name, 'No records removed', "No records have been removed. All records are not synced, or there are no records." );

				} else if ( notification_name === "no_records_synced" ) {

					_priv.exec_notify( true, notification_name, 'No records synchronized', "No records have been synchronized. All records are synced, or there are no records." );

				} else if ( notification_name === "record_is_not_work_order" ) {

					_priv.exec_notify( true, notification_name, "Can't save order", "The record is not a Work Order" );

				} else if ( notification_name === "not_updated_not_edited" ) {

					_priv.exec_notify( true, notification_name, 'Not Synchronized', "A record was not synchronized because it has not been edited." );

				} else if ( notification_name === "record_updated" ) {

					_priv.exec_notify( true, notification_name, 'Record Synchronized', "" );

				} else if ( notification_name === "record_update_failed" ) {

					_priv.exec_notify( true, notification_name, 'Record Update Failed', "" );

				} else if ( notification_name === "saving_record" ) {

					_priv.exec_notify( true, notification_name + Date.now(), 'Synchronizing record data...', "" );

				} else if ( notification_name === "record_saved" ) {

					_priv.exec_notify( true, notification_name + Date.now(), 'Record has been synchronized.',  "" );
				} else if ( notification_name === "no_record_id" ) {

					_priv.exec_notify( true, notification_name, 'Record id was not found',  "" );

				} else if ( notification_name === "failed_to_save_record" ) {

					_priv.exec_notify( true, notification_name, 'Failed to sync the record', data.error_message );

				} else if ( notification_name === "not_logged_in" ) {

					chrome.notifications.create( notification_name, {

						type: 'basic',
						iconUrl: '/img/favicon.png',
						title: "Please log in before synchronizing records.",
						message: "",
						// buttons: [{ title: "Log In" }]

					}, async ( notification_id ) => {

						await _app.x.util.wait( 2000 );
						chrome.notifications.clear( notification_id );

					});

				};

			},

			init_storage: async () => {

				var storage = await _app.x.chrome_p.storage.local.get( null );

				if ( typeof storage.record_info_hash === "undefined" ) {

					storage.record_info_hash = {};

				};
				
				if ( typeof storage.reports === "undefined") {

					storage.reports = {};

				}

				if ( typeof storage.HCChartDataArr === "undefined") {

					storage.HCChartDataArr = {};

				}

				if ( typeof storage.reports_diffs === "undefined") {

					storage.reports_diffs = {};

				}

				if ( typeof storage.picklist_field_values === "undefined" ) {

					storage.picklist_field_values = {};

				};

				if ( typeof storage.tokens === "undefined" ) {

					storage.tokens = {};

				};

				if ( typeof storage.user_info === "undefined" ) {

					storage.user_info = {

						logged_in: false,

					};

				};

				if ( typeof storage.fetched_picklist_arr === "undefined" ) {

					storage.fetched_picklist_arr = [];

				};


				if ( typeof storage.tokens === "undefined" ) {

					storage.tokens = {};

				};

				if ( typeof storage.network_info === "undefined" ) {

					storage.network_info = {

						online: navigator.onLine

					};

				};

				chrome.storage.local.set( storage );

			},

			init_context_menu: async () => {

				await _app.x.chrome_p.contextMenus.removeAll()

				await _app.x.chrome_p.contextMenus.create({

					id: "sync_this_record",
					title: "Sync this record",

					type: "normal",
					contexts: [ "page" ],
					documentUrlPatterns: [ "https://*/lightning/r/WorkOrder/*/view" ],

				});

				await _app.x.chrome_p.contextMenus.create({

					id: "sync_this_record_link",
					title: "Sync this record",

					type: "normal",
					contexts: [ "link" ],
					documentUrlPatterns: [ "https://*/*" ],

				});

			},

			add_observers: () => {

				_app.hub.add_observers( "main_background_module", {

					api_error: ( data ) => {

						if ( data.response.meta.status === 401 ) {

							var user_info = { logged_in: false };

							chrome.storage.local.set({ user_info });
							chrome.runtime.sendMessage({ name: "user_info_updated", data: { user_info } });

						};

					},
					
					chart_api_error: ( data ) => {

						if ( data.response.meta.status === 401 ) {

							var user_info = { logged_in: false };

							chrome.storage.local.set({ user_info });
							chrome.runtime.sendMessage({ name: "user_info_updated", data: { user_info } });

						};

					},
					
					user_logged_in: () => {

						var user_info = { logged_in: true };

						chrome.storage.local.set({ user_info });
						chrome.runtime.sendMessage({ name: "user_info_updated", data: { user_info } });

					},

				});

				chrome.notifications.onButtonClicked.addListener( () => {

					_app.sf_api_manager.launch_web_auth_flow();

				});

				chrome.contextMenus.onClicked.addListener( async ( info, tab ) => {

					if ( info.menuItemId === "sync_this_record" ) {

						var storage = await _app.x.chrome_p.storage.local.get([ "user_info" ]);
						var user_info = storage.user_info;

						var record_id = _priv.url_to_record_id( info.pageUrl );

						if ( record_id && user_info.logged_in ) {

							if ( record_id.indexOf( "0WO" ) === 0 ) {

								_priv.save_record( record_id )
								
							} else {

								_priv.notify( "record_is_not_work_order" );

							};

						} else if ( record_id ) {

							_priv.notify( "not_logged_in" );

						} else {

							_priv.notify( "no_record_id" );

						};

					} else if ( info.menuItemId === "sync_this_record_link" ) {

						var storage = await _app.x.chrome_p.storage.local.get([ "user_info" ]);
						var user_info = storage.user_info;

						var record_id = _priv.url_2_to_record_id( info.linkUrl );

						if ( record_id && user_info.logged_in ) {

							if ( record_id.indexOf( "0WO" ) === 0 ) {

								_priv.save_record( record_id )
								
							} else {

								_priv.notify( "record_is_not_work_order" );

							};

						} else if ( record_id ) {

							_priv.notify( "not_logged_in" );

						} else {

							_priv.notify( "no_record_id" );

						};

					};

				});

				chrome.action.onClicked.addListener( () => {

					var url = chrome.runtime.getURL( "/pages/app/index.html" );

					chrome.tabs.create({

						active: true,
						url: url,

					});

				});

				self.addEventListener( "online", async function ( e ) {

					var storage = await _app.x.chrome_p.storage.local.get([ "network_info" ]);

					storage.network_info.online = true;

					chrome.runtime.sendMessage({ name: "network_info_updated", data: { network_info: storage.network_info } });

					chrome.storage.local.set( storage );

				}, false );

				self.addEventListener( "offline", async function ( e ) {

					var storage = await _app.x.chrome_p.storage.local.get([ "network_info" ]);

					storage.network_info.online = false;

					chrome.runtime.sendMessage({ name: "network_info_updated", data: { network_info: storage.network_info } });

					chrome.storage.local.set( storage );

				}, false );

			},

			parse_table_data_for_report: (report_model, report_data, pickLists, setEditable) => {
			  function parse_array_to_picklist(array){
				  var picklist = [];

				  for (var key in array){
					  picklist.push({ value: array[key].Id, label: array[key].Name });
				  }

				  return picklist;
			  }
			  report_model[report_data.objectName] = [];
			  var searchableFields = {
				  'Engineer__c': {
					  picklistName: 'fikeEngineers'
				  },
				  'OwnerId': {
					  picklistName: 'fikeEngineers'
				  },
				  'ContactId': {
					  picklistName: 'customers'
				  },
				  'Owner.Name': {
					  picklistName: 'fikeEngineers'
				  }
			  };

			  for (var record of report_data.records) {
				  var newRecord = {};
				  for (var field of report_data.fields) {

					var name = field.lookupFieldName !== null ? field.lookupFieldName : field.name;
					newRecord.Id = record.data.Id;

					var value = _.get(record.data, field.name, null);

					if  ( searchableFields[ name ] ) {

						var isRequired = true;

					} else {

						var isRequired = field.isRequired;

					};
					if(report_data.objectName=='Service_Time_Entry__c'){
						if(name=='EngineerName__c'){
							var isRequired = true;
						}
					}
					if(report_data.objectName=='ProductItem'){
						if(name=='EngineerName__c'){
							var isRequired = true;
						}
					}
					newRecord[field.order] = {
						helpText:field.helpText,
						value: value,
						Id: record.data.Id,
						type: searchableFields[name] ? 'SEARCH' : field.type,
						label: field.label,
						isEditable: setEditable === true ? field.isEditable : false,
						isRequired: isRequired,
						options: searchableFields[name] ? parse_array_to_picklist(pickLists[searchableFields[name].picklistName]) :  field.picklistValue,
						name: name
					};
				  }
				  // report_model[report_data.objectName]._isNew = false;
				  report_model[report_data.objectName].title = report_data.title;
				  report_model[report_data.objectName].push(newRecord);
			  }
			},

			order_fields: ( fields ) => {

				var new_fields = [];

				fields.forEach( ( field, index ) => {

					new_fields[ field.order ] = field;

				});

				return new_fields;

			},

			section_to_zone_model: ( section ) => {

				// {

				// 	table_data: {
				// 		fields: {},
				// 		record_id_arr: [],
				// 	},

				// 	zones: [
				// 		{
				// 			zone_data: {},
				// 			asset_arr: [
				// 				{
				// 					asset_data: {},
				// 					table_data: "table_data",
				// 					hardware_checklist_arr: [
				// 						table_data: "table_data",
				// 						sub_asset_arr: [
				// 							{
				// 								table_data: "table_data",
				// 							}
				// 						]		
				// 					]	
				// 				}			
				// 			]
				// 		}
				// 	]

				// }

				var zone_model = {

					record_arr: [],
					zone_arr: [],

				};

				console.log( section );
				console.log( section.records[ 0 ] );
				console.log( section.records[ 0 ].relatedSections );
				console.log( section.records[ 0 ].relatedSections[ 3 ] );

				var zone_record_arr = section.records[ 0 ].relatedSections[ 3 ].records;
				var asset_record_arr = [];
				var sub_asset_record_arr = [];

				zone_record_arr.forEach( ( zone_record ) => {

					var zone = { name: "zone", expanded: false };
					zone_model.zone_arr.push( zone );

					zone.zone_data = zone_record.data;
					zone.asset_arr = [];

					if ( zone_record.relatedSections ) {

						zone_record.relatedSections.forEach( ( asset_section ) => {

							var asset = { name: "asset", expanded: false };
							zone.asset_arr.push( asset );
							asset.table_data = {};
							asset.table_data.record_id_arr = [];
							asset.table_data.fields = asset_section.fields;
							asset.hardware_checklist_arr = [];

							asset_section.records.forEach( ( record_info ) => {

								zone_model.record_arr.push( record_info.data );
								asset.table_data.record_id_arr.push( record_info.data[ "Id" ] );

								if ( record_info.relatedSections ) {

									record_info.relatedSections.forEach( ( hardware_checklist_section ) => {

										var hardware_checklist = { name: "hardware_checklist", expanded: false };
										asset.hardware_checklist_arr.push( hardware_checklist );
										hardware_checklist.table_data = {};
										hardware_checklist.table_data.record_id_arr = [];
										hardware_checklist.table_data.fields = hardware_checklist_section.fields;
										hardware_checklist.sub_asset_arr = [];

										hardware_checklist_section.records.forEach( ( record_info ) => {
											if(record_info.data[ "Id" ]!=undefined){
												zone_model.record_arr.push( record_info.data );
												hardware_checklist.table_data.record_id_arr.push( record_info.data[ "Id" ] );
											}
											if ( record_info.relatedSections ) {

												record_info.relatedSections.forEach( ( sub_asset_section ) => {

													var sub_asset = { name: "sub_asset", expanded: false };
													hardware_checklist.sub_asset_arr.push( sub_asset );
													sub_asset.table_data = {};
													sub_asset.table_data.record_id_arr = [];
													sub_asset.table_data.fields = _priv.order_fields( sub_asset_section.fields );

													sub_asset_section.records.forEach( ( record_info ) => {

														zone_model.record_arr.push( record_info.data );
														sub_asset.table_data.record_id_arr.push( record_info.data[ "Id" ] );

													});

												});

											} else {

												hardware_checklist.sub_asset_arr.push({
													name: "sub_asset",
													expanded: false,
													table_data: null,
												})

											};

										});

									});

								} else {

									asset.hardware_checklist_arr.push({
										name: "hardware_checklist",
										expanded: false,
										table_data: null,
										sub_asset_arr: [{
											name: "sub_asset",
											expanded: false,
											table_data: null,
										}],
									})

								};

							});

						});

					} else {

						zone.asset_arr.push({

							name: "asset",
							expanded: false,
							table_data: null,
							hardware_checklist_arr: [{
								name: "hardware_checklist",
								expanded: false,
								table_data: null,
								sub_asset_arr: [{
									name: "sub_asset",
									expanded: false,
									table_data: null,
								}],
							}]

						});

					};

				});

				console.log( "zone_model", zone_model );

				return zone_model;

			},

			save_record: async ( record_id ,importData ) => {

				function digRecursive(relatedSections, dump, pickLists, setEditable = true) {

					let nestedObjects = {
						Asset_c__c: "Zone__c",
						Hardware_Checklist__c: "Asset_c__c",
						Sub_Asset__c: "Hardware_Checklist__c"
					};

					if(relatedSections.fields){
						_priv.parse_table_data_for_report(dump, relatedSections, pickLists, setEditable);
					}

					if(relatedSections.records){

						for(let recI=0; recI<relatedSections.records.length; recI++){

							let record = relatedSections.records[recI];
							if(!record.relatedSections) continue;

							for(let relatedSection of record.relatedSections){
								if (relatedSection.objectName === "Zone__c") {
									setEditable = false;
								}

								if( nestedObjects[relatedSection.objectName] ){
									let tmpStorage = [],
										parent = nestedObjects[relatedSection.objectName],
										objectName = relatedSection.objectName;

									digRecursive(relatedSection, tmpStorage, pickLists, setEditable);
									
									dump[parent][recI]["_"+objectName] = tmpStorage[objectName];
								}else{
									digRecursive(relatedSection, dump, pickLists, setEditable);
								}

							}

						}
					}
				}

				_priv.notify( "saving_record" );
				var record_for_report={ meta:{success:true}};
				if(importData!=null){
					record_for_report.data=importData;
					record_id=importData.workOrder.Id;
				}
				_app.log( "record_id" + " " + record_id );

				if(importData==null){
					// var record_ui_response = await _app.sf_api_manager.get_record_ui_response( record_id );
					record_for_report = await _app.sf_api_manager.get_report_response( record_id );
				}

				console.log( "record_for_report", record_for_report );
			
				//var recordTypeIds = await _app.sf_api_manager.get_recordTypeId_response( 'Asset_C__c' );
				//var dataRecTest = await _app.sf_api_manager.get_recordType_response( 'Asset_C__c' ,'0121U0000003kCQQAY');
				var responseData= record_for_report.data;

				function getRecords(lstObject,childIdField, lstChild){
					var  recordList=[];
					var recordMap;
					if(lstObject!=null){
						for(var i=0;i<lstObject.length;i++){
							var record={};
							record.data=lstObject[i];
							if(lstChild!=null){
								if(lstObject[i][childIdField]!=undefined && lstChild[(lstObject[i][childIdField])]!=undefined){
									record.relatedSections=lstChild[(lstObject[i][childIdField])];
								}
							}
							recordList.push(record);
						}
					}
					return recordList;
				}
				function getChartData(HCData,listHC,recordTypeWiseHCFields)
				{
					    var HCWiseChart={};
						for(var i=0;i<listHC.length;i++){
							var HC =listHC[i];
							var completedCount=0;
							for(var j=0;j<HCData.length;j++){
								var HCRec=HCData[j];
								if(HCWiseChart[HCRec.Id]==undefined){
									HCWiseChart[HCRec.Id]=[];
									var chartData={};
									chartData.columnName=HCRec.Name;
									chartData.lastModifiedDate=HCRec.LastModifiedDate;
									chartData.data=[];
									chartData.columns=[];
									for(var  k=0;k<recordTypeWiseHCFields[HCRec.RecordType.Name].length;k++){
										var field =recordTypeWiseHCFields[HCRec.RecordType.Name][k];
										chartData.data.push(HCRec[field.name]==undefined?'':HCRec[field.name]);
										chartData.columns.push(field.label);
									}
									HCWiseChart[HCRec.Id].push(chartData);
								}
								
								if(HCWiseChart[HCRec.Id].length>= 10){
									completedCount++;
									continue;
								}
								
								if(HC.Asset_C__c==HCRec.Asset_C__c && HC.LastModifiedDate<HCRec.LastModifiedDate){
									var chartData={};
									chartData.columnName=HC.Name;
									chartData.lastModifiedDate=HC.LastModifiedDate;
									chartData.data=[];
									chartData.columns=[];
									for(var  k=0;k<recordTypeWiseHCFields[HCRec.RecordType.Name].length;k++){
										var field =recordTypeWiseHCFields[HCRec.RecordType.Name][k];
										chartData.data.push(HC[field.name]==undefined?'':HC[field.name]);
										chartData.columns.push(field.label);
									}
									HCWiseChart[HCRec.Id].push(chartData);
								}
							} 
							if(completedCount==HCData.length){
								break;
							} 
						}
					return HCWiseChart;
				}
				function getChartDataByAsset(AssetsData,listHC,recordTypeWiseHCFields)
				{
					var HCWiseChart={};
					var completedCount=0;
					for(var j=0;j<listHC.length;j++){
						var HCRec=listHC[j];
						if(HCWiseChart[HCRec.Asset_C__c]==undefined){
							HCWiseChart[HCRec.Asset_C__c]=[];
						}

						if(HCWiseChart[HCRec.Asset_C__c].length>= 10){
							completedCount++;
							continue;
						}
						
						var chartData={};
						chartData.columnName=HCRec.Name;
						chartData.lastModifiedDate=HCRec.LastModifiedDate;
						chartData.data=[];
						chartData.columns=[];
						for(var  k=0;k<recordTypeWiseHCFields[HCRec.RecordType.Name].length;k++){
							var field =recordTypeWiseHCFields[HCRec.RecordType.Name][k];
							chartData.data.push(HCRec[field.name]==undefined?'':HCRec[field.name]);
							chartData.columns.push(field.label);
						}
						HCWiseChart[HCRec.Asset_C__c].push(chartData);
							
						if(completedCount==AssetsData.length){
							break;
						} 
					}
						
					return HCWiseChart;
				}
				function diffrenciateChartAndTableData(HCWiseChartData)
				{
					var HCWiseChart={};
					for(var HCId in HCWiseChartData){
						var chart={};
						chart.chartData = [];
						chart.tableData = [];
						var removeChartDataIndex=[];
						
						for(var j=0;j<HCWiseChartData[HCId].length;j++){
							var cdata=HCWiseChartData[HCId][j];
							for(var i=cdata.data.length-1;i>=0;i--){
								if(isNaN(cdata.data[i])){
									if(!removeChartDataIndex.includes(i)){
								   		removeChartDataIndex.push(i);
									}
								}
							}
						}
						
						for(var j=0;j<HCWiseChartData[HCId].length;j++){
							var cdata=HCWiseChartData[HCId][j];
						
							if(chart.chartColumns==undefined){
								chart.chartColumns=[];
								chart.tableColumns=[];
								chart.chartColumns=[...cdata.columns];
								chart.tableColumns=[...cdata.columns];
							}
							var  tableData={};
							tableData.Name=cdata.columnName;
							tableData.lastModifiedDate=cdata.lastModifiedDate;
							tableData.data=[];
							tableData.columns=[];
							cdata.numberOfBlanks=0;
							for(var i=cdata.data.length-1;i>=0;i--){
								//if(removeChartDataIndex.includes(i))
								{
									
									tableData.data.push(cdata.data[i]);
									tableData.columns.push(cdata.columns[i]);
									//removeChartDataIndex.add(i);
									//cdata.data.remove(i);
									//cdata.columns.remove(i);
								}
								
							}
							chart.tableData.push(tableData);
							chart.chartData.push(cdata);
						}
						
						var removeChartDataIndexList = removeChartDataIndex.sort(function(a, b){return a-b});
						// remove string data from chart 
						for(var i=removeChartDataIndexList.length-1;i>=0;i--){
							var Index=removeChartDataIndexList[i];
							for(var j=0;j<chart.chartData.length;j++){
								var cdata=chart.chartData[j];
								cdata.data.splice(Index,1);
								cdata.columns.splice(Index,1);
							}
							//chart.tableColumns.push(chart.chartColumns[Index]);
							chart.chartColumns.splice(Index,1);
						}
						HCWiseChart[HCId]=chart;
					}
					return HCWiseChart;
					
				}

				var AssetIdWiseGroupSubAssets={};
				if(responseData.SubAssets!=undefined && responseData.SubAssets.length>0){
					var SubAsset=responseData.SubAssets;
					for(var i=0;i<SubAsset.length;i++ ){
						if(AssetIdWiseGroupSubAssets[SubAsset[i].Asset__c]==undefined){
							AssetIdWiseGroupSubAssets[SubAsset[i].Asset__c]=[];
						}
						AssetIdWiseGroupSubAssets[SubAsset[i].Asset__c].push(SubAsset[i]);
					}
				}

				var  AssetsWiseSubAssetsSections={};
            
            for(var AssetsId in AssetIdWiseGroupSubAssets){
                
                // Add Sub Asset Section
                var section={};
                section.Title='Sub Assets';
                section.objectName='Sub_Asset__c';
                section.fields=responseData.ObjectFields['Sub_Asset__c'];
                section.records= getRecords(AssetIdWiseGroupSubAssets[AssetsId],'',null);
                
				AssetsWiseSubAssetsSections[AssetsId]=[];
				AssetsWiseSubAssetsSections[AssetsId].push(section);
            } 
			
			var AssetIdWiseGroupHC={};
				if(responseData.HardwareCheckLists!=undefined && responseData.HardwareCheckLists.length>0){
					var HC=responseData.HardwareCheckLists;
					for(var i=0;i<HC.length;i++ ){
						if(AssetIdWiseGroupHC[HC[i].Asset_C__c]==undefined){
							AssetIdWiseGroupHC[HC[i].Asset_C__c]=[];
						}
						AssetIdWiseGroupHC[HC[i].Asset_C__c].push(HC[i]);
					}
				}
				

		   var MapAssets={};
		   if(responseData.Assets!=undefined){
			for(var i=0;i<responseData.Assets.length;i++){
				MapAssets[responseData.Assets[i].Id]=responseData.Assets[i];
				if(AssetIdWiseGroupHC[responseData.Assets[i].Id]==undefined){
					AssetIdWiseGroupHC[responseData.Assets[i].Id]=[];
					AssetIdWiseGroupHC[responseData.Assets[i].Id].push({"Asset_C__c":responseData.Assets[i].Id});
				}
			}
			}
			
			var  AssetsWiseHCSections={};
            
            for(var AssetsId in AssetIdWiseGroupHC){
                
                // Add Sub Asset Section
                var section={};
				section.Title='Hardware Checklists';
                section.objectName='Hardware_Checklist__c';
                section.fields=responseData.recordTypeWiseHCFieldSet[MapAssets[AssetsId].RecordType.Name];
                section.records= getRecords(AssetIdWiseGroupHC[AssetsId],'Asset_C__c',AssetsWiseSubAssetsSections);
                
				AssetsWiseHCSections[AssetsId]=[];
				AssetsWiseHCSections[AssetsId].push(section);
            } 

				
			 // Add WorkOrderZone Section
			 var  sectionWorkOrderZone={};
			 sectionWorkOrderZone.Title='Zone Status';
			 sectionWorkOrderZone.objectName='Work_Order_Zone__c';
			 sectionWorkOrderZone.fields=responseData.ObjectFields['Work_Order_Zone__c'];
			 sectionWorkOrderZone.records= getRecords(responseData.WorkOrderZone,'',null);

			  // Add ServiceTimeEntry Section
			  var sectionServiceTimeEntry={};
			  sectionServiceTimeEntry.Title='Service Time Entries';
			  sectionServiceTimeEntry.objectName='Service_Time_Entry__c';
			  sectionServiceTimeEntry.fields=responseData.ObjectFields['Service_Time_Entry__c'];
			  sectionServiceTimeEntry.records= getRecords(responseData.ServiceTimeEntry,'',null);
			  
			  // Add ProductItem  Section
			  var sectionProductItem ={};
			  sectionProductItem.Title='Materials';
			  sectionProductItem.objectName='ProductItem';
			  sectionProductItem.fields=responseData.ObjectFields['ProductItem'];
			  sectionProductItem.records= getRecords(responseData.ProductItem,'',null);
			  

			  var ZoneWiseGroupAssets={};
			  if(responseData.ZoneAssets!=undefined && responseData.ZoneAssets.length>0){
				  var ZoneAssets=responseData.ZoneAssets;
				  for(var i=0;i<ZoneAssets.length;i++ ){
					  if(ZoneWiseGroupAssets[ZoneAssets[i].Zone__c]==undefined){
						ZoneWiseGroupAssets[ZoneAssets[i].Zone__c]=[];
					  }
					  if(MapAssets[ZoneAssets[i].Asset__c]!=undefined){
								ZoneWiseGroupAssets[ZoneAssets[i].Zone__c].push(MapAssets[ZoneAssets[i].Asset__c]);
						}
				  }
			  }

			  
			  var ZoneWiseGroupAssetsSections={};
			  var  setAssetIds=[];
			  for(var ZoneId in ZoneWiseGroupAssets){
				  
				 var lstAssetsSection=[];
				  for(var i=0;i< ZoneWiseGroupAssets[ZoneId].length;i++){
					  var  Asset =ZoneWiseGroupAssets[ZoneId][i];
					  // Add Sub Asset Section
					  var  sectionAssets=[];
					  sectionAssets.Title='Assets';
					  sectionAssets.objectName='Asset_c__c';
					  //sectionAssets.fields=getFieldType('Asset_c__c',lstAssetFields,lstAssetFieldsEditable);
					  //sectionAssets.fields=getFieldFromFieldSet(Asset.RecordType.Name,'Asset_c__c'); // commented to resolve cpu limit
					  sectionAssets.fields=responseData.recordTypeWiseAssetsFieldSet[Asset.RecordType.Name];
					  var assetArr=[];
					  assetArr.push(Asset);
					  sectionAssets.records= getRecords(assetArr,'Id',AssetsWiseHCSections);
					  if(setAssetIds.includes(Asset.Id)){
						  sectionAssets.isEditable=false;
					  }
					  lstAssetsSection.push(sectionAssets);
					  setAssetIds.push(Asset.Id);
				  }
				  ZoneWiseGroupAssetsSections[ZoneId]=lstAssetsSection;
			  }
			
			var chartRecData={};

			if(importData==null){
				var record_for_chart = await _app.sf_api_manager.get_chart_response( setAssetIds );

				console.log( "record_for_chart", record_for_chart );

				//var chartRecData= diffrenciateChartAndTableData(getChartData(responseData.HardwareCheckLists,record_for_chart,responseData.recordTypeWiseHCFieldSet));
				chartRecData= diffrenciateChartAndTableData(getChartDataByAsset(responseData.Assets,record_for_chart,responseData.recordTypeWiseHCFieldSet));
				
				console.log( "record_for_chart", chartRecData );
			}
			var  AssetComments=responseData.AssetComments;
			var ExistingComments=responseData.ExistingComments;

			var IdWiseAssetComment={};
			for(var index in AssetComments){
				IdWiseAssetComment[AssetComments[index].Id]=AssetComments[index];
		   }

			var AssetWiseComments={};
			for(var index in ExistingComments){
				 if(AssetWiseComments[ExistingComments[index].Asset__c]==undefined){
					AssetWiseComments[ExistingComments[index].Asset__c]=[];
				 }
				 var data=IdWiseAssetComment[ExistingComments[index].Asset_Comment__c];
				 if(data!=undefined){
					data.record_id=ExistingComments[index].Id;
				 	AssetWiseComments[ExistingComments[index].Asset__c].push(data);
				 }
			}

			var sectionZones={};
			sectionZones.Title='Zones'; 
			sectionZones.objectName='Zone__c';
			sectionZones.fields=responseData.ObjectFields['Zone__c'];
			sectionZones.records= getRecords(responseData.Zones,'Id',ZoneWiseGroupAssetsSections);
			
			  var WorkOrderWiseSections={};
			  var WORelatedSections=[];
			  WORelatedSections.push(sectionWorkOrderZone);
			  WORelatedSections.push(sectionServiceTimeEntry);
			  WORelatedSections.push(sectionProductItem);
			  WORelatedSections.push(sectionZones);

			WorkOrderWiseSections[responseData.workOrder.Id]=WORelatedSections;
			
			// Add WorkOrder Section
			var sectionWorkOrder={};
			sectionWorkOrder.Title='Work Order';
			sectionWorkOrder.objectName='WorkOrder';
			sectionWorkOrder.fields=responseData.ObjectFields['WorkOrder'];
			var listOfWorkOrder=[];
			listOfWorkOrder.push(responseData.workOrder);
			sectionWorkOrder.records= getRecords(listOfWorkOrder,'Id',WorkOrderWiseSections);
			
			var RW={};
            RW.sections= [];
            RW.sections.push(sectionWorkOrder);
			RW.customers=responseData.customers;
            RW.fikeEngineers=responseData.fikeEngineers;
            RW.dependentOptionsForEquipmentType= responseData.dependentOptionsForEquipmentType;
            
            //DefaultSection
            RW.defaultFieldLists =[];
            
            var  defaultSubAsset={};
            defaultSubAsset.Title='Sub Assets';
            defaultSubAsset.objectName='Sub_Asset__c';
            defaultSubAsset.fields=responseData.ObjectFields['Sub_Asset__c'];
            
            RW.defaultFieldLists.push(defaultSubAsset);
            
            var defaultAsset={};
            defaultAsset.Title='Assets';
            defaultAsset.objectName='Asset_C__c';
            defaultAsset.fields=responseData.recordTypeWiseAssetsFieldSet['Offline'];
            //getFieldFromFieldSet('Offline','Asset_c__c'); // commeted to resolve cpu limit
            
            RW.defaultFieldLists.push(defaultAsset);
            
            var defaultSTE={};
            defaultSTE.Title='Service Time Entries';
            defaultSTE.objectName='Service_Time_Entry__c';
            defaultSTE.fields=responseData.ObjectFields['Service_Time_Entry__c'];
            
            RW.defaultFieldLists.push(defaultSTE);
            
            var defaultPI={};
            defaultPI.Title='Materials';
            defaultPI.objectName='ProductItem';
            defaultPI.fields=responseData.ObjectFields['ProductItem'];
            
            RW.defaultFieldLists.push(defaultPI);

			record_for_report.data=RW;
			record_for_report.data.HCChartData=chartRecData;  
				var zone_model = _priv.section_to_zone_model( record_for_report.data.sections[ 0 ] );

				console.log( "zone_model", zone_model );

				var storage = await _app.x.chrome_p.storage.local.get([ "record_info_hash", "picklist_field_values", "fetched_picklist_arr", "reports", "reports_diffs", "HCChartDataArr" ]);

				storage.HCChartDataArr[record_id] = {};
				storage.HCChartDataArr[record_id] = record_for_report.data.HCChartData;

				storage.default_filed_hash = {};
				storage.default_hc_recordtypewise_field=responseData.recordTypeWiseHCFieldSet;
				storage.default_asset_recordtypewise_field=responseData.recordTypeWiseAssetsFieldSet;
				storage.recordTypeIdByNameHC=responseData.recordTypeIdByNameHC;
				storage.recordTypeIdByNameAsset=responseData.recordTypeIdByNameAsset;
				record_for_report.data.defaultFieldLists.forEach( ( data ) => {
					data.fields=_.orderBy(data.fields, 'order'); 
					storage.default_filed_hash[ data.objectName ] = data;

				});

				if ( record_for_report.meta.success ) {

					var report_model = {};
					report_model.selectedAssetComment=AssetWiseComments;
					report_model.AssetComments=AssetComments;
					report_model.zone_model = zone_model;
					report_model.WORecordType=(responseData.workOrder.RecordType!=null)?responseData.workOrder.RecordType.DeveloperName:"";
           
					report_model.fikeEngineers = record_for_report.data.fikeEngineers;

					var pickLists = {customers : record_for_report.data.customers, fikeEngineers : record_for_report.data.fikeEngineers};

					digRecursive(record_for_report.data.sections[0], report_model, pickLists);

					report_model.dependentOptionsForEquipmentType = record_for_report.data.dependentOptionsForEquipmentType;
					report_model.files = [];
					report_model.Short_Report__c = {
						label: 'Short Report (Free Text approx 3000 characters)',
						value: '',
						isEditable: true,
						type: 'TEXTAREA'
					};

					report_model.status_data = {
						edited: false,
						child_edited: false,
						edited_and_synced: false,
						sync_status: {

							name: "no_info",
							details: "",

						},
						edited_status: 'not_edited',
					};

					report_model.record_id = record_id;

					storage.reports[record_id] = {};
					storage.reports[record_id] = report_model;

					if (storage.reports_diffs[record_id])
						delete storage.reports_diffs[record_id];

				}

				await _app.x.chrome_p.storage.local.set( JSON.parse(JSON.stringify(storage)) );

				// added to auto refresh when data sync
				
				chrome.runtime.sendMessage({ name: "records_info_updated", data: { reportmodel: report_model } });

				_priv.notify( "record_saved" );

			},

			response_to_sync_status: ( response ) => {

				var sync_status = { name: "", details: "" };

				if ( response.meta.success ) {

					sync_status.name = "success";

				} else {

					sync_status.name = "error";

					if ( response.data && response.data.message ) {

						sync_status.details = `${ response.meta.status } - ${ response.data.message }`;

					} else if ( response.data && response.data[ 0 ] && response.data[ 0 ].message ) {

						sync_status.details = `${ response.meta.status } - ${ response.data[ 0 ].message }`;

					};

				};

				return sync_status;

			},

		};

		var _pub = {

			init: async ( app ) => {

				_app = app;
				_priv.init_storage();
				_priv.init_context_menu();
				_priv.add_observers();

		// dirty hack for cases when online/offline event doesn't work
		setInterval(
		  () => {
			var xhr = new XMLHttpRequest();
			xhr.open('HEAD', 'https:/login.salesforce.com/', true);
			xhr.timeout = 2000;


			xhr.onload = ()=> self.dispatchEvent(new Event("online"));
			xhr.onerror = ()=> self.dispatchEvent(new Event("offline"));
			xhr.ontimeout = ()=> self.dispatchEvent(new Event("offline"));

			  xhr.send(null);
		  },
		  60*1000
		);

			},

			launch_web_auth_flow: async () => {

				_app.sf_api_manager.launch_web_auth_flow();
				
			},
			checkInstanceType: async () => {

				_app.sf_api_manager.launch_web_auth_flow();
				
			},

			log_out: async () => {

				chrome.storage.local.set({

					tokens: {},
					user_info: { logged_in: false },
					salesforce_org_type:''
				});

			},

			force_sync: async ( data ) => {

				var record_id = data.record_id;
				var storage = await _app.x.chrome_p.storage.local.get([ "reports", "reports_diffs","HCChartDataArr","recordTypeIdByNameHC" ]);
				// var record_info = storage.record_info_hash[ record_id ];
				var report = storage.reports[ record_id ];
				var reports_diffs = storage.reports_diffs[ record_id ];
				var sync_status = { name: "no_info", details: "" };
				var synced_record_count = 0;
				var exportData={};

				function isNumeric(value) {
					return /^\d+$/.test(value);
				}
			
				var checklistContent=["ProductItem","Service_Time_Entry__c","WorkOrder","Work_Order_Zone__c","Zone__c","zone_model","selectedAssetComment"];
				var finalData={};
				// New Checking of report difference
				if(report){
					
					// iterate over record
					for(var key in report){ 
						// if key include in list
						if(checklistContent.includes(key)){

							// If array
							if(Array.isArray(report[key])){
								for(var i in report[key] ){
									var recData = report[key][i];
									for(var recKey in recData){ 
										if(recData[recKey].isChange){
											if(finalData[recData[recKey].Id]==undefined){
												finalData[recData[recKey].Id]={};
												
												if(Number.isInteger(recData[recKey].Id) || isNumeric(recData[recKey].Id)){
													finalData[recData[recKey].Id].Type='Insert';
													finalData[recData[recKey].Id].objectName=key;
													finalData[recData[recKey].Id].Service_Work_Order__c=record_id;
													finalData[recData[recKey].Id].Work_Order__c=record_id;
													if (key === 'ProductItem'){
														finalData[recData[recKey].Id].workOrderId = record_id;
													}
													if (key === 'Service_Time_Entry__c'){
														finalData[recData[recKey].Id].Service_Time_Entry__c = record_id;
													}
												}else{
													finalData[recData[recKey].Id].Type='Edit';
													finalData[recData[recKey].Id].Id=recData[recKey].Id;
												}
											}
											finalData[recData[recKey].Id][recData[recKey].name]=recData[recKey].type=='SEARCH'?(recData[recKey].value==null?null:recData[recKey].value.value):recData[recKey].value;
										}
									}
								}
							}
							else{
								if(key=="zone_model"){
									var recordHash=report[key]["record_hash"]
									for(var i in report[key]["zone_arr"] ){
										var zoneId=report[key]["zone_arr"][i].zone_data.Id
										var assetArray = report[key]["zone_arr"][i]["asset_arr"];
										for(var j in assetArray ){
											
											if(assetArray[j]["table_data"]!=null){
												var fields=assetArray[j]["table_data"].fields;
												if(assetArray[j]["table_data"].record_id_arr!=undefined){
													for(var l in assetArray[j]["table_data"].record_id_arr ){
														var recId=assetArray[j]["table_data"].record_id_arr[l];
														var rec=recordHash[recId];
														for(var k in fields ){
															var recData=fields[k];
															for(var recKey in recData){ 
																if(recKey=="isChange_"+recId){
																	if(finalData[recId]==undefined){
																		finalData[recId]={};
																		finalData[recId].Id=recId;
																		if(Number.isInteger(recId) || isNumeric(recId)){
																			finalData[recId].Type='Insert';
																			finalData[recId].objectName='Asset_C__c';
																			finalData[recId].Service_Work_Order__c=record_id;
																			finalData[recId].Work_Order__c=record_id;
																			finalData[recId].Zone__c=zoneId;
																			finalData[recId].local=true;
																			if(rec.RecordType!=null){
																				finalData[recId].RecordTypeName=rec.RecordType.Name;
																			}
																			
																		}else{
																			finalData[recId].Type='Edit';
																			
																		}
																	}
																	finalData[recId][recData.name]=rec[recData.name];
																}
															}
														}
														// Hardware checklist
														var hardCheckArray = assetArray[j]["hardware_checklist_arr"];
														for(var m in hardCheckArray ){
															if(hardCheckArray[m]["table_data"]!=null){
																var fields=hardCheckArray[m]["table_data"].fields;
																if(hardCheckArray[m]["table_data"].record_id_arr!=undefined){
																	for(var o in hardCheckArray[m]["table_data"].record_id_arr ){
																		var recIdHC=hardCheckArray[m]["table_data"].record_id_arr[o];
																		var recHC=recordHash[recIdHC];
																		for(var k in fields ){
																			var recData=fields[k];
																			for(var recKey in recData){ 
																				if(recKey=="isChange_"+recIdHC){
																					if(finalData[recIdHC]==undefined){
																						finalData[recIdHC]={};
																						
																						finalData[recIdHC].Id=recIdHC;
																						if(Number.isInteger(recIdHC) || isNumeric(recIdHC)){
																							finalData[recIdHC].Type='Insert';
																							finalData[recIdHC].objectName='Hardware_Checklist__c';
																							finalData[recIdHC].Work_Order__c=record_id;
																							finalData[recIdHC].Asset_C__c=recId;
																							finalData[recIdHC].recordTypeId=storage.recordTypeIdByNameHC[rec.RecordType.Name];
																						}else{
																							finalData[recIdHC].Type='Edit';
																						}
																					}
																					finalData[recIdHC][recData.name]=recHC[recData.name];
																				}
																			}
																		}

																		
																	}
																}

															}
															//sub asset
																		
															var subAssetArray = hardCheckArray[m]["sub_asset_arr"];
															if(subAssetArray!=undefined){
																for(var n in subAssetArray ){
																	if(subAssetArray[n]["table_data"]!=null){
																		var fields=subAssetArray[n]["table_data"].fields;
																		if(subAssetArray[n]["table_data"].record_id_arr!=undefined){
																			for(var p in subAssetArray[n]["table_data"].record_id_arr ){
																				var recIdSubAss=subAssetArray[n]["table_data"].record_id_arr[p];
																				var recSubAss=recordHash[recIdSubAss];
																				for(var k in fields ){
																					var recData=fields[k];
																					for(var recKey in recData){ 
																						if(recKey=="isChange_"+recIdSubAss){
																							if(finalData[recIdSubAss]==undefined){
																								finalData[recIdSubAss]={};
																								finalData[recIdSubAss].Id=recIdSubAss;
																								if(Number.isInteger(recIdSubAss) || isNumeric(recIdSubAss)){
																									finalData[recIdSubAss].Type='Insert';
																									finalData[recIdSubAss].objectName='Sub_Asset__c';
																									finalData[recIdSubAss].Work_Order__c=record_id;
																									finalData[recIdSubAss].Asset__c=recId;
																									finalData[recIdSubAss].Service_Work_Order__c=record_id;
																									finalData[recIdSubAss].Zone__c=zoneId;
																								}else{
																									finalData[recIdSubAss].Type='Edit';
																									
																								}
																							}
																							finalData[recIdSubAss][recData.name]=recSubAss[recData.name];
																						}
																					}
																				}
																			}
																		}
																	}

																	
																}
															}
															
														}

														// Assets comment
														var assetCommet = assetArray[j]["selectedComments"];
														for(var m in assetCommet ){
															
															
															if(finalData[assetCommet[m].record_id]==undefined){
																finalData[assetCommet[m].record_id]={}
															}
															finalData[assetCommet[m].record_id].Id=assetCommet[m].record_id;
															finalData[assetCommet[m].record_id].Asset__c=recId;
															finalData[assetCommet[m].record_id].Asset_Comment__c=assetCommet[m].Id;
															finalData[assetCommet[m].record_id].objectName="Asset_And_Asset_Comment_Mapping__c";
															if(Number.isInteger(assetCommet[m].record_id) || isNumeric(assetCommet[m].record_id)){
																finalData[assetCommet[m].record_id].Type="Insert";
															}else{
																finalData[assetCommet[m].record_id].Type="Edit";
															}
															
														}
													}
												}

											}
											
										}
									}

										
								}
							}
						}
					}
					console.log('finalData ',finalData);
				}

				for(var key in reports_diffs){
					if(reports_diffs[key].Type!=undefined && reports_diffs[key].Type=='Delete'){
						finalData[key]=reports_diffs[key];
					}
				}

				reports_diffs=finalData;
				if ( reports_diffs ) {

					reports_diffs = $.extend( true, {}, reports_diffs );

					console.log( "reports_diffs", reports_diffs );

					if ( synced_record_count === 0 ) {

						chrome.runtime.sendMessage({

							name: "sync_status_updated",
							data: {
								record_id: record_id,
								record_info: report,
								sync_status: { name: "progress", details: "" },
							},

						});

					};

					synced_record_count++;

					for (var item in reports_diffs){
					  if (reports_diffs[item].child) {
						  reports_diffs[item].child = Object.values (reports_diffs[item].child);
					  }
					}

					var local_asset_hash = {};

					for ( var key in reports_diffs ) {

						var item = reports_diffs[ key ];

						if ( item.local && item.objectName === "Asset_C__c" && item.Type === "Insert" ) {

							local_asset_hash[ item[ "Id" ] ] = item;
							delete item.local;
							item.child = [];

						};

					};

					console.log( "reports_diffs", reports_diffs );
					console.log( "local_asset_hash", local_asset_hash );

					var reports_diff_arr = Object.values( reports_diffs );

					for ( var i = reports_diff_arr.length; i--; ) {

						if ( reports_diff_arr[ i ].Type === "Insert" ) {

							delete reports_diff_arr[ i ][ "Id" ];

						};

						if ( reports_diff_arr[ i ].objectName === "Hardware_Checklist__c"  && local_asset_hash[ reports_diff_arr[ i ].Asset_C__c ]  ) {

							local_asset_hash[ reports_diff_arr[ i ].Asset_C__c ].child.push( reports_diff_arr[ i ] );

							delete reports_diff_arr[ i ][ "Asset_C__c" ];

							reports_diff_arr.splice( i, 1 );

						}

						else if ( reports_diff_arr[ i ].objectName === "Sub_Asset__c" && local_asset_hash[ reports_diff_arr[ i ].Asset__c ]  ) {

							local_asset_hash[ reports_diff_arr[ i ].Asset__c ].child.push( reports_diff_arr[ i ] );

							delete reports_diff_arr[ i ][ "Asset__c" ];

							reports_diff_arr.splice( i, 1 );

						}else if ( reports_diff_arr[ i ].objectName === "Asset_And_Asset_Comment_Mapping__c" && local_asset_hash[ reports_diff_arr[ i ].Asset__c ]  ) {

							local_asset_hash[ reports_diff_arr[ i ].Asset__c ].child.push( reports_diff_arr[ i ] );

							delete reports_diff_arr[ i ][ "Asset__c" ];

							reports_diff_arr.splice( i, 1 );

						} else if ( typeof reports_diff_arr[ i ].Id === "number" ) {

							reports_diff_arr.splice( i, 1 );

						};

					};

					console.log( "reports_diff_arr", reports_diff_arr );

					var response = await _app.sf_api_manager.update_report( record_id, reports_diff_arr );

					console.log( "response", response );
					
					if ( response.meta.success ) {
					
						
						exportData.reports={};
						exportData.reports[record_id]=storage.reports[record_id];
						var WOName=record_id;
						if(exportData.reports[record_id].WorkOrder!=undefined && exportData.reports[record_id].WorkOrder.length>0){
							var fields=exportData.reports[record_id].WorkOrder[0];
							for (var field_id in fields){
								/*console.log(fields[field_id].name);
								console.log(fields[field_id].value);
								console.log('break');*/
								if (fields[field_id].name === 'WorkOrderNumber')
									WOName= fields[field_id].value;
							}
						}

						exportData.reports_diffs={};
						exportData.reports_diffs[record_id]=storage.reports_diffs[record_id];
						exportData.HCChartDataArr={};
						exportData.HCChartDataArr[record_id]=storage.HCChartDataArr[record_id];
						
						
						
									
						delete storage.reports_diffs[ record_id ];
						
						report.status_data.edited = false;
						report.status_data.edited_and_synced = true;
						report.status_data.edited_status = 'edited_and_synced';

						sync_status = {
							name : 'success',
							details : 'Synced.'
						};

					} else {
						report.status_data.edited = true;
						report.status_data.edited_and_synced = false;
						report.status_data.edited_status = '';

						if ( response.data && response.data[ 0 ] && response.data[ 0 ].message ) {

						    sync_status = {
						        name : 'error',
						        details : response.data[ 0 ].message,
						    };

						};
							
						report.status_data.sync_status = sync_status;

						chrome.runtime.sendMessage({

							name: "sync_status_updated",
							data: {
								record_id: record_id,
								record_info: report,
								status_data: report.status_data,
								sync_status: sync_status,
							},

						});

						return;

					};

					report.status_data.sync_status = sync_status;

				};

				if ( report.files && report.files.length > 0 && synced_record_count === 0 ) {

					chrome.runtime.sendMessage({

						name: "sync_status_updated",
						data: {
							record_id: record_id,
							record_info: report,
							sync_status: { name: "progress", details: "" },
						},

					});

				};

				for ( var i = report.files.length; i--; ) {

					synced_record_count += 1;

					var response = await _app.sf_api_manager.upload_file({

						record_id: record_id,
						file_data: report.files[ i ],

					});

					if ( 200 <= response.meta.status && response.meta.status < 300 ) {

						report.files.splice( i, 1 );

						report.status_data.edited = false;
						report.status_data.edited_and_synced = true;
						report.status_data.edited_status = 'edited_and_synced';

						sync_status = {
							name : 'success',
							details : 'Synced.'
						};

					} else {

						report.status_data.edited = true;
						report.status_data.edited_and_synced = false;
						report.status_data.edited_status = '';
						
					    sync_status = {
					        name : 'error'
					  	};
						if ( response.data && response.data.message ) {

							sync_status.details =  response.data.message ;

						} else if ( response.data && response.data[ 0 ] && response.data[ 0 ].message ) {

							sync_status.details = response.data[ 0 ].message ;

						};

					}

					report.status_data.sync_status = sync_status;

				};

				_app.log( "force_sync" + " " + record_id, report );

				if ( synced_record_count === 0 ) {

					_priv.notify( "not_updated_not_edited" );

				} else {

					report.status_data.sync_status = sync_status;

					chrome.runtime.sendMessage({

						name: "sync_status_updated",
						data: {
							record_id: record_id,
							record_info: report,
							status_data: report.status_data,
							sync_status: sync_status,
						},

					});
					
				}
				if(exportData.reports!=undefined){
					delete storage.reports[ record_id ];
					delete storage.HCChartDataArr[ record_id ];
					var tempElem = document.createElement('a');
					tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData)));
					tempElem.setAttribute('download','SuccessBackup_WorkOrder('+ WOName+')');
					tempElem.click();
				}
				

				await _app.x.chrome_p.storage.local.set( storage );

				_app.log( "update_response", response );

			},
			importFileEP: async ( data ) => {
				_priv.save_record( null,data );
			},
			update_records: async () => {

				var storage = await _app.x.chrome_p.storage.local.get([ "reports", "reports_diffs" ]);
				var reports = storage.reports;
				var synced_record_count = 0;

				for (var report_id in reports){
					if (reports[report_id].status_data.edited){
						chrome.runtime.sendMessage({
							name: "sync_status_updated",
							data: {
								record_id: report_id,
								record_info: reports[report_id],
								sync_status: { name: "progress", details: "" },
							},

						});
						synced_record_count++;
						await _pub.force_sync({ record_id: report_id });
					}
				}

				if ( synced_record_count === 0 ) {

					_priv.notify( "no_records_synced" );

				}

			},

			remove_synced_records: async () => {

				var storage = await _app.x.chrome_p.storage.local.get([ "reports", "reports_diffs" ]);
				var reports = storage.reports;
				var removed_record_count = 0;

				for ( var report_id in reports ) {

					if ( reports && reports[ report_id ] ) {

						var report = reports[ report_id ];

						if ( report.status_data.edited_status === "edited_and_synced" ) {

							delete storage.reports[report_id];
							delete storage.reports_diffs[report_id];

							chrome.runtime.sendMessage({

								name: "record_removed",
								data: { report_id },

							});

							removed_record_count++;

						};

					};


				};

				if ( removed_record_count === 0 ) {

					_priv.notify( "no_records_removed" );

				};

				await _app.x.chrome_p.storage.local.set( storage );

			},

		};

		return _pub;

	};