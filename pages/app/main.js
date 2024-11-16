
	Vue.component('v-select', VueSelect.VueSelect );
	Vue.filter('formatDate', function(value) { 
		if (value) {
		  return moment(String(value)).format('DD/MMM/YYYY')
		}
	  });
	  Vue.filter('formatPhone', function(value) { 
		if (value) {
		  return value;
		}
	  });
	
	Vue.component('editable-field', {
		template: $( "#templates .editable-field" ).get( 0 ).outerHTML,
		props: [ "fieldModel", "activeRecordModel", "mode" ],
		data: function () {
			if(this.fieldModel.oldValue==undefined){
				this.fieldModel.oldValue=this.fieldModel.value;
			}
			return {
				options: []
			}
		},
		methods:{
			handle_input: function ( value ) {
				
				console.log( "SDFDSFSFD", value );
				console.log( this.fieldModel );

				this.fieldModel.value = value
				this.$emit( "c-change", this.fieldModel );

			},
			onChange(){

				
				if(this.fieldModel.oldValue!=this.fieldModel.value){
					this.fieldModel.isChange=true;
				}else{
					this.fieldModel.isChange=false;
				}
				this.$forceUpdate();
				if ( ( this.fieldModel.type === "DATE" || this.fieldModel.type ) && this.fieldModel.value === "" ) {
						if(this.fieldModel.value === ""){
							this.$emit('c-change', this.fieldModel);
						}
				} else {
					
					this.$emit('c-change', this.fieldModel);

				};

			},
			toString(fieldModel, value){
			//console.log('here we are doing our work' + fieldModel.type);
				/*if (fieldModel.type === 'SEARCH'){
				console.log(' SEARCh TYPE FIELD');
				console.log(fieldModel);
				console.log(fieldModel.options.length);
				if( fieldModel.options.length > 0 ) {
					for(var i=0; i< fieldModel.options.length;i++) {
						if( fieldModel.options[i].label == fieldModel.value) {
							return fieldModel.options[i].value;
						}
					}
				}

				}*/


				if ( fieldModel.type === "SEARCH" ) {

					if	( fieldModel.value && fieldModel.value.label ) {

						return fieldModel.value.label;
						
					} else if ( fieldModel.value ) {

						return fieldModel.value;

					} else {

						return "";

					};

				};

				if (fieldModel.type === 'TIME'){
					if (fieldModel.value !== null && fieldModel.value !== "" ){
						fieldModel.value= moment(fieldModel.value, 'HH:mm').format('HH:mm');
						return moment(fieldModel.value, 'HH:mm').format('LT');
						// return moment(fieldModel.value, 'HH:mm').format('HH:mm:ss.SSS[Z]');
					}
					else{
						return fieldModel.value;
					}
				}

				if (fieldModel.type === 'DATE'){
					if (fieldModel.value !== null && fieldModel.value !== "" ){
						return moment(fieldModel.value, 'YYYY-MM-DD').format('DD/MMM/YYYY');
						// return moment(fieldModel.value, 'HH:mm').format('HH:mm:ss.SSS[Z]');
					}
					else{
						return fieldModel.value;
					}
				}
	

				if (typeof value === "boolean"){
				return value ? 'X' : '';
				}else {
					return value;
				}
			}
		},

	});

	Vue.component( 'editable_field_2', {

		template: $( "#templates .editable_field_2" ).get( 0 ).outerHTML,
		props: [ "record", "field", "mode", "table_data", "parent", "dependent_options" ],
		data: function () {

			/*if(this._model.changes_in_report_model[this.currentRecordId]!=undefined 
				&& this._model.changes_in_report_model[this.currentRecordId][this.record.Id]!=undefined
				&& this._model.changes_in_report_model[this.currentRecordId][this.record.Id][ this.field.name ]!=undefined){
				this.field.isChange=true;
			}*/

			if ( typeof this.record[ this.field.name ] === "undefined" && this.field.name === "Equipment_Type__c" ) {

				console.log( "setting" );
				Vue.set( this.record, this.field.name, "" );

			};

			var data = {

				value: this.record[ this.field.name ],
				options: [],

			};

			if ( this.record[ "Equipment_Type__c" ] ) {

				data[ "Equipment_Type__c" ] = this.record[ "Equipment_Type__c" ];

			};

			return data;

		},
		methods: {

			get_value: function () {

				// if ( typeof this.record[ this.field.name ] === "undefined" ) {

				// 	this.record[ this.field.name ] = "";

				// };

				// var value = 

				return this.record[ this.field.name ];

			},

			handle_change: function () {
				
				if(this.field['isChange_'+this.record.Id]==undefined)
				{
					this.field['isChange_'+this.record.Id]=true;
					this.$forceUpdate();
				}
				if ( ( this.field.type === "DATE" || this.field.type ) && this.value === "" ) {

				} else {

					this.record[ this.field.name ] = this.value;

					console.log( "handle_change" );

					this.$emit( "record_change", {

						record: this.record,
						field: this.field

					});

					if ( this.field.name === "Equipment_Type__c" ) {

						this.$forceUpdate();

					};
					

				};

			},

			get_options: function () {

				if ( this.field.name === "Size1__c" ) {

					var controlling_value = this.record[ "Equipment_Type__c" ];
					var options = [];

					if ( controlling_value && this.dependent_options[ controlling_value ] ) {

						this.dependent_options[ controlling_value ].forEach( ( size ) => {

							options.push({
								value: size,
								label: size,
							});

						});

					};

					return options;

				} else {

					return this.field.picklistValue;

				};

			},
			toString(fieldModel, value){
			
				if (fieldModel.type === 'DATE'){
					if (value !== null && value !== "" && value !== undefined ){
						return moment(value, 'YYYY-MM-DD').format('DD/MMM/YYYY');
						// return moment(fieldModel.value, 'HH:mm').format('HH:mm:ss.SSS[Z]');
					}
					else{
						return value;
					}
				}
	

				if (typeof value === "boolean"){
				return value ? 'X' : '';
				}else {
					return value;
				}
			},
		

		},

		// computed: {

		// 	options: function () {

		// 		if ( this.field.name === "Size1__c" ) {

		// 			var controlling_value = this.record[ "Equipment_Type__c" ];
		// 			var options = [];

		// 			if ( controlling_value && this.dependent_options[ controlling_value ] ) {

		// 				this.dependent_options[ controlling_value ].forEach( ( size ) => {

		// 					options.push({
		// 						value: size,
		// 						label: size,
		// 					});

		// 				});

		// 			};

		// 			return options;

		// 		} else {

		// 			return this.field.picklistValue;

		// 		};

		// 	},

		// },

	    watch: {
	        record: {
	            handler: function ( newValue ) {

	            	// this.value = this.record[ this.field.name ];

	            	// console.log( "record_change_handler" );

	            	Vue.set( this, "value", this.record[ this.field.name ] );

	            	if ( this.field.name === "Size1__c" ) {

	            		if ( this.record[ "Equipment_Type__c" ] !== this[ "Equipment_Type__c" ] ) {
							if ( this.field.name === "Equipment_Type__c" ) {
								if(this.field['isChange_'+this.record.Id]==undefined)
								{
									this.field['isChange_'+this.record.Id]=true;
									this.$forceUpdate();
								}
							}

	            			console.log( "changing Equipment_Type__c" );

	            			this[ "Equipment_Type__c" ] = this.record[ "Equipment_Type__c" ];
	            			this.value = "";
							this.record[ "Size1__c" ] = "";
							
							// Change recordType

	            			this.options = this.get_options();

	            			this.handle_change();

	            		};

					}
					
	            	// console.log( "record", newValue[ "Id" ] );
	            	// console.log( "parent", this.parent, "field" )

	            },
	            deep: true
	        }
	    },

	    created: function () {

	    	this[ "Equipment_Type__c" ] = this.record[ "Equipment_Type__c" ];
	    	this.options = this.get_options();

	    },

	});

	Vue.component( 'info_table', {

		template: $( "#templates .info_table" ).get( 0 ).outerHTML,
		props: [ "table_type", "parent", "table_data", "record_hash", "mode", "enable_delete", "enable_chart", "zone", "dependent_options","check_class" ,"report_type"],
		data: function () {

			var enable_delete = typeof this.enable_delete === "undefined" ? false : this.enable_delete;
			var check_class  = typeof this.check_class === "undefined" ? false : this.check_class;
			var report_type = typeof this.report_type === "undefined" ? false : this.report_type;
			return {

				enable_delete: enable_delete,
				check_class:check_class,
				report_type:report_type

			};
		},
		methods: {

			get_value: function ( record_id, field ) {

				var record = this.record_hash[ record_id ];
				var value = record[ field.name ];

				return value;

			},

			get_record: function ( record_id ) {

				var record = this.record_hash[ record_id ];
				// console.log( "get_record", record_id, record );

				return record;

			},

			handle_record_change: function ( data ) {
	
				if(data.record.Equipment_Type__c!=undefined && data.record.Equipment_Type__c!=null && 
					data.record.RecordType!=undefined && data.record.RecordType.Name!=data.record.Equipment_Type__c){
					var fieldsbyType=this.$default_asset_recordtypewise_field[data.record.Equipment_Type__c];
					if(fieldsbyType!=undefined && fieldsbyType!=null && fieldsbyType.length>0){
						var oldFields=this.table_data.fields;
						var alreadyChange={};
						if(oldFields!=null){
							oldFields.forEach( ( field ) => {
								if(field['isChange_'+data.record.Id]==true){
									alreadyChange[field.name]=true;
								}
							});
						}
						fieldsbyType.forEach( ( field ) => {
							if(alreadyChange[field.name]!=undefined && alreadyChange[field.name]==true){
								if(field['isChange_'+data.record.Id]==undefined)
								{
									field['isChange_'+data.record.Id]=true;
									this.$forceUpdate();
								}
							}
						});

						this.table_data.fields=fieldsbyType;
					}
				}
				console.log( "handle_record_change" );
				this.$emit( "record_change", data );

			},

			handle_remove: function ( parent, record_id ) {

				this.$emit( "remove_request", { parent, record_id, zone: this.zone } );

			},

			handle_chart: function ( record_id ) {

				this.$emit( "handle_chart", { record_id } );

			},

			record_exists: function ( record_id ) {

				if ( this.record_hash[ record_id ] ) {

					return true;

				} else {

					return false;

				};

			},
			isSubAssetExpired: function ( record_id ) {
				if(!this.check_class){
					return false;
				}
				
				if ( this.record_hash[ record_id ] ) {

					if(this.record_hash[ record_id ].Expiry_Date__c!=undefined ){
						return moment(this.record_hash[ record_id ].Expiry_Date__c, 'YYYY-MM-DD').toDate() < moment().add(-12, 'M');
					}
					return false;

				} else {

					return false;

				};

			},
			className: function ( record_id ) {
				
				if(!this.check_class){
					return '';
				}
				var dynaClass= this.report_type=='Medium'?'hideClass':'';
				var rec=this.record_hash[ record_id ];
				if ( rec ) {

					if(rec.Expiry_Date__c!=undefined ){
						return moment(rec.Expiry_Date__c, 'YYYY-MM-DD').toDate() <moment().toDate()?'redClass': (moment(rec.Expiry_Date__c, 'YYYY-MM-DD').toDate() < moment().add(12, 'M').toDate())?'yellowClass':dynaClass;
					}
					return dynaClass;

				} else {

					return dynaClass;

				};

			},

		},

	});
	
	var main_view = ( function () {
		window.addEventListener('beforeunload', function (e) {
				// Cancel the event
				if(_model.hasRecordChange==true){
					e.returnValue = 'Please save before leave the page';
				}
		});
		var _app = null;

		var _model = {

			page_is_loaded: false,
			display_spinner: false,
			loading_overlay_is_hidden: false,
			hasRecordChange:false,

			active_page_name: "status_items",
			record_details_mode: "read",

			record_active_tab_name: "details",

			active_record_model: null,

			modal_dialog_model: {

				active: false,
				active_card_name: "",

			},
			SFViewModel:"",
			dummyDataTmp: {},
			report_model: {},
			shortReport :{},
			mediumReport :{},
			printWorkingHoursOnly :false,
			allZoneDifferentPage : false,
			assetComment:{},
			report_type:'',
			customerDate: new Date().toISOString().slice(0,10) ,
			engineerDate: new Date().toISOString().slice(0,10) ,
			customerPhone :'',
			engineerPhone :'',
			reports_array: {},
			changes_in_report_model: {},
			chart: null,
			chartTable: {},
			isSandbox: false,
			chartView:"Chart",
			pdf_active: 0,
			dependen_picklist: {}

		};

		var _state = {

			issues_flag: null,

			page_info: null,

		};

		var _priv = {

			record_arr_to_record_hash: ( record_arr ) => {

				var record_hash = {};

				for ( var i = record_arr.length; i--; ) {

					record_hash[ record_arr[ i ][ "Id" ] ] = record_arr[ i ];

				};

				return record_hash;

			},

			file_to_base_64: ( file ) => {

				return new Promise( ( resolve ) => {

					var reader = new FileReader();
					reader.readAsDataURL( file );

					reader.onload = function () {

						resolve( reader.result );

					};

					reader.onerror = function (error) {

						console.log('Error: ', error);

					};

				});

			},

			prepend_arr: function ( arr, item ) {

				var new_arr = [];

				new_arr.push( item );

				for ( var item in arr ) {

					new_arr.push( arr[ item ] );

				};

				return new_arr;

			},

			hide_loading_overlay: async () => {

				await _app.x.util.wait( 300 );
				_model.loading_overlay_is_hidden = true;

			},

			set_active_page_name: ( page_name ) => {

				if ( page_name === "status_items" ) {

					if ( _state.issues_flag ) {

						_model.active_page_name = "issue_page";

					} else {

						_model.active_page_name = "status_items";

					};

				} else {

					_model.active_page_name = page_name;

				};

			},

			close_drawer: () => {

				$( "#drawer_overlay" ).get( 0 ).classList.remove( "opened" );

				webextension_library.util.wait( 200 )
				.then( () => {

					$( "#drawer_overlay" ).css( "display", "none" );

				});

			},

			add_observers: () => {

				window.onpopstate = function(event) {

					_priv.set_active_page_name( "main" );

				};

				chrome.runtime.onMessage.addListener( ( message ) => {

					_app.log( "runtime_message" + " " + message.name, message );

					if ( message.name === "record_removed" ) {

						Vue.delete(_model.reports_array, message.data.report_id);

					} else if ( message.name === "network_info_updated" ) {

						_model.network_info = message.data.network_info;

					} 
					else if ( message.name === "salesforce_org_detail_updated" ) {

						_model.salesforceOrgType = message.data.salesforce_org_type;

					} 
					
					else if ( message.name === "sync_status_updated" ) {

						if ( message.data.sync_status && message.data.sync_status.name === "success" ) {
							if(_model.changes_in_report_model!=undefined){
								_model.changes_in_report_model={}
							}
							if( message.data.recordId!=undefined){
								_model.changes_in_report_model[message.data.recordId ] = {};
							}
							if(_model.report_model!=undefined){
							_model.changes_in_report_model[ _model.report_model.record_id ] = {};
							}
							
						};

						// var record_info = message.data.record_info;
						// var edited_status = "";

						// if ( record_info.edited || record_info.child_edited ) {

						// 	edited_status = "edited";

						// } else if ( record_info.edited_and_synced ) {

						// 	edited_status = "edited_and_synced";

						// } else {

						// 	edited_status = "not_edited";

						// };

						// if ( record_info.file_data_arr && record_info.file_data_arr.length === 0 ) {

						// 	Vue.set( _model.reports_array[ message.data.record_id ], "file_model_arr", [] );

						// };

						// Vue.set( _model.reports_array[ message.data.record_id ].status_data, "edited_status", edited_status );

						if ( message.data.status_data ) {

							Vue.set( _model.reports_array[ message.data.record_id ], "status_data", message.data.status_data );

						} else if ( message.data.sync_status ) {

							Vue.set( _model.reports_array[ message.data.record_id ].status_data, "sync_status", message.data.sync_status );

						};

						if ( message.data.sync_status && message.data.sync_status.name === "success" ) {
							 // comment auto remove record
							delete _model.reports_array[ message.data.record_id ];
							
						}


					} else if ( message.name === "records_info_updated" ) {
						if(message.data!=undefined && message.data.reportmodel!=undefined && message.data.reportmodel.record_id!=undefined && 	_model.reports_array!=undefined){
							if(_model.reports_array[ message.data.reportmodel.record_id]==undefined){
								_model.reports_array[ message.data.reportmodel.record_id]=message.data.reportmodel;
							}
						}
					}else if ( message.name === "user_info_updated" ) {

						_model.user_info = message.data.user_info;

						if ( message.data.user_info.logged_in ) {

							_model.modal_dialog_model.active = true;
							_model.modal_dialog_model.active_card_name = "logged_in";

						} else {

							_model.modal_dialog_model.active = true;
							_model.modal_dialog_model.active_card_name = "logged_out";

						};

					};

				});

			},

		};

		var _pub = {

			init: async ( app ) => {

				_app = app;
				_model.config = _app.config;

				_priv.add_observers();

				var storage = await _app.x.chrome_p.storage.local.get([ "network_info", "user_info", "reports", "reports_diffs", "default_filed_hash" ,"salesforce_org_type","default_hc_recordtypewise_field","default_asset_recordtypewise_field","recordTypeIdByNameHC","recordTypeIdByNameAsset","SFViewModel"]);

				_app.x.log( "storage", storage );

				console.log( $.extend( true, {}, storage ) );

				_state.default_filed_hash = storage.default_filed_hash;
				_state.default_hc_recordtypewise_field = storage.default_hc_recordtypewise_field;
				Vue.prototype.$default_asset_recordtypewise_field = storage.default_asset_recordtypewise_field;
				Vue.prototype.$default_hc_recordtypewise_field = storage.default_hc_recordtypewise_field;
				
				_state.recordTypeIdByNameHC=storage.recordTypeIdByNameHC;
				_state.recordTypeIdByNameAsset=storage.recordTypeIdByNameAsset;
				 
				_model.salesforceOrgType=storage.salesforce_org_type;
				_model.network_info = storage.network_info;
				_model.reports_array = storage.reports;
				_model.SFViewModel=storage.SFViewModel;
				_model.report_model = storage.reports[0];

				_model.user_info = storage.user_info;
				_model.changes_in_report_model = storage.reports_diffs;

				_priv.set_active_page_name( "main" );
				
				
				new Vue({

					el: "#root",
					data: _model,
					methods: {

						get_asset_name: function ( zone_model, asset ) {

							try {

								return zone_model.record_hash[ asset.table_data.record_id_arr[ 0 ] ].Name;
								
							} catch ( e ) {

								return "";

							};

						},
						get_recordtype_name: function ( zone_model, asset ) {

							try {

								//return zone_model.record_hash[ asset.table_data.record_id_arr[ 0 ] ].RecordType.Name;
								// Changed on 30-06 to include changes on equipement type change
								return zone_model.record_hash[ asset.table_data.record_id_arr[ 0 ] ].Equipment_Type__c;
								
							} catch ( e ) {

								return "";

							};

						},
						get_asset_Id: function ( zone_model, asset ) {

							try {

								return zone_model.record_hash[ asset.table_data.record_id_arr[ 0 ] ].Id;
								
							} catch ( e ) {

								return "";

							};

						},

						file_input_change: function ( event ) {

							_state.file_input = event.target;
							_state.files = event.target.files;

						},

						card_tab_click: ( tab_name ) => {

							_model.record_active_tab_name = tab_name;

						},

						force_sync_click: async ( report_model ) => {

							var response = await _app.x.bg_api.exec( "main", "force_sync", {

								record_id: report_model.record_id,

							});
							

						},
						export_record: async ( report_model ) => {

							chrome.storage.local.get(null, function(items) {
								if(items!=undefined && items.reports!=undefined){
									var exportData={};
									exportData.reports={};
									exportData.reports[report_model.record_id]=items.reports[report_model.record_id];
									exportData.reports_diffs={};
									exportData.reports_diffs[report_model.record_id]=items.reports_diffs[report_model.record_id];
									exportData.HCChartDataArr={};
									exportData.HCChartDataArr[report_model.record_id]=items.HCChartDataArr[report_model.record_id];
									var blob = new Blob([JSON.stringify(exportData)], {type: "text/plain;charset=utf-8"});
									saveAs(blob, "FikeData.txt");
								}
								
							});

						},
						delete_record: async ( report_model ) => {

							if ( confirm( "Are you sure you want to delete this record?" ) === false ) {

								return;

							};
							var storage = await _app.x.chrome_p.storage.local.get([ "reports", "reports_diffs" ]);
							delete storage.reports[report_model.record_id];
							delete storage.reports_diffs[report_model.record_id];
							await _app.x.chrome_p.storage.local.set( storage );

							location.reload();

						},

						save_files_for_future_upload: async function () {

							var storage = await _app.x.chrome_p.storage.local.get([ "reports" ]);
							var report_id = _model.report_model.record_id;
							var report = storage.reports[ report_id ];

							for ( var i = 0; i < _state.files.length; i++ ) {

								var base_64 = await _priv.file_to_base_64( _state.files[ i ] );
								if(base_64==undefined || base_64==null || base_64.split( ";base64," ).length<=1){
									alert('Invalid File');
									return;
								}
								report.files.push({

									id: Date.now() + "_" + i,
									name: _state.files[ i ].name,
									type: _state.files[ i ].type,
									base_64: base_64.split( ";base64," )[ 1 ],

								});
								_model.report_model.files.push({

									id: Date.now() + "_" + i,
									name: _state.files[ i ].name,
									type: _state.files[ i ].type,
									base_64: base_64.split( ";base64," )[ 1 ],

								});

								//_model.report_model.files.push({ name: _state.files[ i ].name })

							}

							var status_data = {

								child_edited: true,
								edited: true,
								edited_and_synced: false,
								edited_status: "edited",
								sync_status: { name: "no_info" }

							};

							_model.reports_array[_model.report_model.record_id].status_data = status_data;
							_model.report_model.status_data = status_data;

							_state.file_input.value = null;
							chrome.storage.local.set( storage );

							// save change to storage

							// var storage = await _app.x.chrome_p.storage.local.get([ "reports_diffs", "reports" ]);

							// storage.reports_diffs = _model.changes_in_report_model;

							// // _model.reports_array[_model.report_model.record_id].status_data.edited_status = 'edited';
							// // _model.reports_array[_model.report_model.record_id].status_data.edited = true;

							// var status_data = {

							// 	child_edited: true,
							// 	edited: true,
							// 	edited_and_synced: false,
							// 	edited_status: "edited",
							// 	sync_status: { name: "no_info" }

							// // };

							// _model.reports_array[_model.report_model.record_id].status_data = status_data;
							// _model.report_model.status_data = status_data;

							// // Vue.set( _model.report_model, "status_data", status_data );

							// console.log( "save_changes_to_storage", _model.report_model.status_data );

							// storage.reports[_model.report_model.record_id] = JSON.parse(JSON.stringify(_model.report_model));

							// chrome.storage.local.set( storage );

							// var status_data = {

							// 	child_edited: true,
							// 	edited: true,
							// 	edited_and_synced: false,
							// 	edited_status: "edited",
							// 	sync_status: { name: "no_info" }

							// };

							// _model.reports_array[_model.report_model.record_id].status_data = status_data;
							// _model.report_model.status_data = status_data;

							// Vue.set( _model.report_model, "status_data", status_data );

							// this.$set( _model.report_model.status_data, "edited_status", status_data.edited_status );
							// this.$set( _model.report_model, "status_data", status_data );
							// this.$forceUpdate();

							// console.log( "status_data", _model.report_model.status_data );

							// storage.reports[_model.report_model.record_id] = JSON.parse(JSON.stringify(_model.report_model));


						},

						remove_file_record: async ( report_model, target_file ) => {

							var storage = await _app.x.chrome_p.storage.local.get([ "reports" ]);
							var report = storage.reports[ report_model.record_id ];

							for ( var i = report_model.files.length; i--; ) {

								if ( report_model.files[ i ].id === target_file.id ) {

									report_model.files.splice( i, 1 );
									break;

								}

							}

							for ( var i = report.files.length; i--; ) {

								if ( report.files[ i ].id === target_file.id ) {

									report.files.splice( i, 1 );
									break;

								}

							}

							chrome.storage.local.set( storage );

						},

						api_name_to_icon_url: function ( api_name ) {

							if ( api_name === "WorkOrder" ) {

								return "/img/work_order_120.png";

							} else if ( api_name === "Hardware_Checklist__c" ) {

								return "/img/custom62_120.png";

							};

						},

						save_report: async function () {

							var storage = await _app.x.chrome_p.storage.local.get([ "reports" ]);

							// storage.reports[_model.report_model.record_id] = JSON.parse(JSON.stringify(_model.reports_array[_model.report_model.record_id]));
							storage.reports[_model.report_model.record_id] = JSON.parse(JSON.stringify(_model.report_model));
							chrome.storage.local.set(storage);

						},

						get_name_field: function ( record_model ) {

							var name_record_field_name = record_model.objectInfo.nameFields[ 0 ]

							return this.get_field_display_value( record_model, name_record_field_name );

						},

						get_name_field_big: function ( record_model ) {

							var name_record_field_name = record_model.objectInfo.nameFields[ 0 ]
							var display_value = this.get_field_display_value( record_model, name_record_field_name );

							return record_model.label + " " + display_value;

						},

						get_field_display_value: ( fields, field_name ) => {

							for (var field_id in fields){
								/*console.log(fields[field_id].name);
								console.log(fields[field_id].value);
								console.log('break');*/
								if (fields[field_id].name === field_name)
									return fields[field_id].value;
							}
							return '';

						},

						show_record_details: async ( report_model ) => {
							document.getElementsByClassName('spinner')[0].style.display='';
							document.getElementsByClassName('spinnerText')[0].innerHTML='Retrieving Details...';
							document.getElementsByClassName('spinnerOverLay')[0].style.display='';
						
							_model.report_model = JSON.parse(JSON.stringify(await _app.x.chrome_p.storage.local.get(["reports"]))).reports[report_model.record_id];

							_model.report_model.zone_model.record_hash = _priv.record_arr_to_record_hash( _model.report_model.zone_model.record_arr );
							Vue.prototype.currentRecordId=report_model.record_id;
							var fields=_model.report_model.WorkOrder[0];
							for (var field_id in fields){
								if (fields[field_id].name === 'ContactPhone__c')
								_model.customerPhone= fields[field_id].value;
								if (fields[field_id].name === 'OwnerPhone__c')
								_model.engineerPhone= fields[field_id].value;
							}
							
								// Object.keys( _model.reports_array ).forEach( ( key ) => {

								// 	var report = _model.reports_array[ key ];

								// });

							history.pushState( { record_id: report_model.record_id }, "record_model_page", "index.html" );
							_app.log( "show_record_details", report_model );

							_priv.set_active_page_name( "record_details" );
							_model.record_active_tab_name = "report";
							document.getElementsByClassName('spinner')[0].style.display='none';
							document.getElementsByClassName('spinnerOverLay')[0].style.display='none';
							document.getElementsByClassName('spinnerText')[0].innerHTML='';
							
						},

						ensure_change_object: function ( record_id ) {

							if ( !_model.changes_in_report_model[ _model.report_model.record_id ] ) {

								_model.changes_in_report_model[ _model.report_model.record_id ] = {};

							};

							var change_object_hash = _model.changes_in_report_model[ _model.report_model.record_id ];

							if ( typeof change_object_hash[ record_id ] === "undefined" ) {

								change_object_hash[ record_id ] = {

									"Id": record_id,

								};

							};

							return change_object_hash[ record_id ];

						},
						onActivePageChange: async  function (page_name) {
							if(_model.hasRecordChange){

								// check required field validation
								// Engineers Hours Validation
								var requiredFieldMissing=false;
								var fieldName='';
								var ServiceEntry=_model.report_model.Service_Time_Entry__c;
								for(var i in ServiceEntry){
									for(var j in ServiceEntry[i]){
										var EH=ServiceEntry[i][j];
										if(EH.isRequired){
											if(EH.value==undefined || EH.value==null || EH.value==''){
												fieldName=EH.label;
												requiredFieldMissing=true;
											}
										}
									}
								}
								if(requiredFieldMissing){
									alert(fieldName+' Field Required in Engineers Hours');
									return;
								}

								// Material Validation
								var keyInfo=_model.report_model.ProductItem;
								for(var i in keyInfo){
									for(var j in keyInfo[i]){
										var KI=keyInfo[i][j];
										if(KI.isRequired){
											if(KI.value==undefined || KI.value==null || KI.value=='' ){
												var checkValidation=true;
												if(KI.name=='OwnerId'){
													for(var k in keyInfo[i]){
														if(keyInfo[i][k].name=='Fike_Stock__c' && keyInfo[i][k].value!=true){
															checkValidation=false;
														}
													}
												}
												if(checkValidation){
													fieldName=KI.label;
													requiredFieldMissing=true;
													break;
												}
											}
										}
									}
									if(requiredFieldMissing){
										break;
									}
								}
								if(requiredFieldMissing){
									alert(fieldName+ ' Field Required in Material');
									return;
								}


								
								

								document.getElementsByClassName('spinner')[0].style.display='';
								document.getElementsByClassName('spinnerText')[0].innerHTML='Saving Data...';
								document.getElementsByClassName('spinnerOverLay')[0].style.display='';
								var storage = await _app.x.chrome_p.storage.local.get([ "reports_diffs", "reports" ]);

								storage.reports_diffs = _model.changes_in_report_model;

								// _model.reports_array[_model.report_model.record_id].status_data.edited_status = 'edited';
								// _model.reports_array[_model.report_model.record_id].status_data.edited = true;

								var status_data = {

									child_edited: true,
									edited: true,
									edited_and_synced: false,
									edited_status: "edited",
									sync_status: { name: "no_info" }

								};

								_model.reports_array[_model.report_model.record_id].status_data = status_data;
								_model.report_model.status_data = status_data;

								// Vue.set( _model.report_model, "status_data", status_data );

								console.log( "save_changes_to_storage", _model.report_model.status_data );

								storage.reports[_model.report_model.record_id] = JSON.parse(JSON.stringify(_model.report_model));

								chrome.storage.local.set( storage );

								_priv.set_active_page_name( page_name );
								document.getElementsByClassName('spinner')[0].style.display='none';
								document.getElementsByClassName('spinnerOverLay')[0].style.display='none';
								document.getElementsByClassName('spinnerText')[0].innerHTML='';

								_model.hasRecordChange=false;
								
							}else{
								_priv.set_active_page_name( page_name );
							}
							
						},

						save_changes_to_storage: async function () {

							var storage = await _app.x.chrome_p.storage.local.get([ "reports_diffs", "reports" ]);

							storage.reports_diffs = _model.changes_in_report_model;

							// _model.reports_array[_model.report_model.record_id].status_data.edited_status = 'edited';
							// _model.reports_array[_model.report_model.record_id].status_data.edited = true;

							var status_data = {

								child_edited: true,
								edited: true,
								edited_and_synced: false,
								edited_status: "edited",
								sync_status: { name: "no_info" }

							};

							_model.reports_array[_model.report_model.record_id].status_data = status_data;
							_model.report_model.status_data = status_data;

							// Vue.set( _model.report_model, "status_data", status_data );

							console.log( "save_changes_to_storage", _model.report_model.status_data );

							storage.reports[_model.report_model.record_id] = JSON.parse(JSON.stringify(_model.report_model));

							chrome.storage.local.set( storage );

						},

						handle_record_change: async function ( data ) {

							console.log( "handle_record_change", data );
							
							if(data.record.Equipment_Type__c!=undefined && data.record.Equipment_Type__c!=null && 
							data.record.RecordType!=undefined && data.record.RecordType.Name!=data.record.Equipment_Type__c){
								var fieldsbyType=this.$default_hc_recordtypewise_field[data.record.Equipment_Type__c];
								if(fieldsbyType!=undefined && fieldsbyType!=null && fieldsbyType.length>0){
									var ZoneData=_model.report_model.zone_model.zone_arr;
									for(var i in ZoneData){
										var AssetData=ZoneData[i].asset_arr;
										for(var j in AssetData){
											if(AssetData[j].table_data!=undefined &&  data.record.Id!=undefined  ){
												if(AssetData[j].table_data.record_id_arr[ 0 ]==data.record.Id){
													var HCData=AssetData[j].hardware_checklist_arr;
													for(var k in HCData){
														if ( HCData[k].table_data === null ) {

															HCData[k].table_data = {
																record_id_arr: [],
																fields: fieldsbyType
															};
															
														};
														var oldFields=HCData[k].table_data.fields;
														var alreadyChange={};
														if(oldFields!=null){
															oldFields.forEach( ( field ) => {
																if(field['isChange_'+data.record.Id]==true){
																	alreadyChange[field.name]=true;
																}
															});
														}
														fieldsbyType.forEach( ( field ) => {
															if(alreadyChange[field.name]!=undefined && alreadyChange[field.name]==true){
																if(field['isChange_'+data.record.Id]==undefined)
																{
																	field['isChange_'+data.record.Id]=true;
																	this.$forceUpdate();
																}
															}
														});

														HCData[k].table_data.fields=fieldsbyType;


													}
												}
											}
											
										} 

									}
								}
								data.record.RecordType.Name=data.record.Equipment_Type__c;
							}

							var record_id = data.record[ "Id" ]
							var change_object = this.ensure_change_object( record_id );

							// do not set type Edit if an item is being created

							if ( change_object.Type !== "Insert" ) {

								change_object.Type = "Edit";

							};

							change_object[ data.field.name ] = data.record[ data.field.name ];

							if ( change_object && change_object[ "OwnerId" ] && change_object[ "OwnerId" ].value ) {

								change_object[ "OwnerId" ] = change_object[ "OwnerId" ].value;

							};

							_app.log( "change_object", change_object );
							_model.hasRecordChange=true;
							//this.save_changes_to_storage();

						},

						handle_remove_request: function ( data ) {

							if ( confirm( "Are you sure you want to delete this record?" ) === false ) {

								return;

							};

							console.log( "handle_remove_request", data.parent.name );

							var zone_model = _model.report_model.zone_model;
							var record = zone_model.record_hash[ data.record_id ];

							if ( data.parent.name === "sub_asset" ) {

								var index = data.parent.table_data.record_id_arr.indexOf( data.record_id );
								data.parent.table_data.record_id_arr.splice( index, 1 );

								for(var indx in zone_model.record_arr){
									if(zone_model.record_arr[indx].Id==data.record_id ){
										zone_model.record_arr.splice( indx, 1 );
									}
								}
								//var index = zone_model.record_arr.indexOf( data.record_id );
								//zone_model.record_arr.splice( index, 1 );

								delete zone_model.record_hash[ data.record_id ];

								if ( record.local ) {

									// remove change object from storage

									delete _model.changes_in_report_model[ _model.report_model.record_id ][ data.record_id ];

								} else {

									// add a removal change object to storage

									var change_object = this.ensure_change_object( data.record_id );
									change_object.Type = "Delete";

								};
								_model.hasRecordChange=true;
								//this.save_changes_to_storage();

							}else if ( data.parent.name === "hardware_checklist" ) {

								//var index = data.parent.table_data.record_id_arr.indexOf( data.record_id );
								//data.parent.table_data.record_id_arr.splice( index, 1 );

								var ZoneData=_model.report_model.zone_model.zone_arr;
								for(var i in ZoneData){
									var AssetData=ZoneData[i].asset_arr;
									for(var j in AssetData){
										
											var HCData=AssetData[j].hardware_checklist_arr;
											for(var k in HCData){
												if(HCData[k].table_data!=null && HCData[k].table_data.record_id_arr.indexOf(data.record_id )!=-1){
													HCData[k].table_data.record_id_arr.splice( HCData[k].table_data.record_id_arr.indexOf(data.record_id ), 1 );
												};
												

											}
										
										
									} 

								} 

								/*var index = zone_model.record_arr.indexOf( data.record_id );
								zone_model.record_arr.splice( index, 1 );*/
								for(var indx in zone_model.record_arr){
									if(zone_model.record_arr[indx].Id==data.record_id ){
										zone_model.record_arr.splice( indx, 1 );
									}
								}

								delete zone_model.record_hash[ data.record_id ];

								if ( record.local ) {

									// remove change object from storage

									delete _model.changes_in_report_model[ _model.report_model.record_id ][ data.record_id ];

								} else {

									// add a removal change object to storage

									var change_object = this.ensure_change_object( data.record_id );
									change_object.Type = "Delete";

								};
								_model.hasRecordChange=true;
								//this.save_changes_to_storage();

							} else if ( data.parent.name === "asset" ) {

								var index = data.zone.asset_arr.indexOf( data.parent );
								var assetRec = data.zone.asset_arr.splice( index, 1 );

								// retrive HC and Sub Asset for delete
								for(var i in assetRec){
									var HCData=assetRec[i].hardware_checklist_arr;
									for(var k in HCData){
										if(HCData[k].table_data!=null && HCData[k].table_data.record_id_arr!=null){

											var HCRecordIds=HCData[k].table_data.record_id_arr;
											for(var j in HCRecordIds){
												var hcdelerec = zone_model.record_hash[ HCRecordIds[j] ];

												if ( hcdelerec.local ) {

													// remove change object from storage

													delete _model.changes_in_report_model[ _model.report_model.record_id ][ HCRecordIds[j]  ];

												} else {

													// add a removal change object to storage

													var change_object = this.ensure_change_object( HCRecordIds[j]  );
													change_object.Type = "Delete";

												};
												delete hcdelerec;
											}
										}
										if(HCData[k].sub_asset_arr!=null ){
											var subAssetArrRec=HCData[k].sub_asset_arr;
											for(var l in subAssetArrRec){
												if(subAssetArrRec[l].table_data!=null && subAssetArrRec[l].table_data.record_id_arr!=null){
												
													var subAssRecordIds=subAssetArrRec[l].table_data.record_id_arr;
													for(var j in subAssRecordIds){
														var subAssDel = zone_model.record_hash[ subAssRecordIds[j] ];
		
														if ( subAssDel.local ) {
		
															// remove change object from storage
		
															delete _model.changes_in_report_model[ _model.report_model.record_id ][ subAssRecordIds[j]  ];
		
														} else {
		
															// add a removal change object to storage
		
															var change_object = this.ensure_change_object( subAssRecordIds[j]  );
															change_object.Type = "Delete";
		
														};
														delete subAssDel;
													}
												}
											}
											
										}
									}
									
								
								}

								delete zone_model.record_hash[ data.record_id ];

								if ( record.local ) {

									// remove change object from storage

									delete _model.changes_in_report_model[ _model.report_model.record_id ][ data.record_id ];

								} else {

									// add a removal change object to storage

									var change_object = this.ensure_change_object( data.record_id );
									change_object.Type = "Delete";
									change_object.Zone__c = data.zone.zone_data[ "Id" ];

								};
								_model.hasRecordChange=true;
								//this.save_changes_to_storage();

							};

						},

						handle_chart: function ( data ) {

							this.draw_chart( data.record_id );

						},

						remove_work_order: async function ( report_model ) {

							if ( confirm( "Do you really want to remove this work order from the extension?" ) === false ) {

								return;

							};

							var storage = await _app.x.chrome_p.storage.local.get([ "reports", "reports_diffs" ]);

							delete storage.reports[ report_model.record_id ];
							delete storage.reports_diffs[ report_model.record_id ];

							await _app.x.chrome_p.storage.local.set( storage );

							location.reload();

						},
						newAssetComment: function ( assetId,asset ) {
							if(_model.report_model.selectedAssetComment==undefined){
								_model.report_model.selectedAssetComment={};
							}
							if(_model.report_model.selectedAssetComment[assetId]==undefined){
								_model.report_model.selectedAssetComment[assetId]=[];
							}
							var comment=_model.report_model.selectedAssetComment[assetId];
							var record_id = Date.now();
							for(var index in asset.selectedComments){
								if(comment.indexOf(asset.selectedComments[index])==-1){
									var new_record = {};
									
									new_record[ "Id" ] = record_id+parseInt(index);
									// push changes to the change object

									var change_object = this.ensure_change_object( new_record[ "Id" ] );

									// change_object.local = asset.local;

									change_object.Type = "Insert";
									change_object.objectName = "Asset_And_Asset_Comment_Mapping__c";
									change_object.Asset__c = assetId;
									change_object.Asset_Comment__c = asset.selectedComments[index].Id;
									
									_app.log( "change_object", change_object );
									asset.selectedComments[index].local=true;
									asset.selectedComments[index].record_id=new_record[ "Id" ];
		
									comment.push(asset.selectedComments[index]);
								}
							}
							_model.report_model.selectedAssetComment[assetId]=comment;
							_model.hasRecordChange=true;
							//this.save_changes_to_storage();
							this.$forceUpdate();

						},
						deleteComment: function ( assetId,commentId ) {
							var deleteRec={};
							var comments=_model.report_model.selectedAssetComment[assetId];
							for(var index in comments){
								if(comments[index].Id==commentId){
									deleteRec=comments.splice(index, 1)[0];
									break;
								}
							}
							_model.report_model.selectedAssetComment[assetId]=comments;
							if ( deleteRec.local!=undefined && deleteRec.local==true ) {

								// remove change object from storage

								delete _model.changes_in_report_model[ _model.report_model.record_id ][ deleteRec.record_id ];

							} else {

								// add a removal change object to storage

								var change_object = this.ensure_change_object( deleteRec.record_id );
								change_object.Type = "Delete";

							};
							_model.hasRecordChange=true;
							//this.save_changes_to_storage();
							this.$forceUpdate();
							
						},
						new_asset_button_click: function ( zone_model, zone ) {
							zone.expanded=true;
							_model.record_details_mode = "edit";

							var new_record = {};
							var record_id = Date.now();
							new_record[ "Id" ] = record_id;

							new_record[ "Equipment_Type__c" ] = "";
							new_record[ "RecordType" ] ={ "Name":"Offline"};
							new_record['selectedComments']=[];


							new_record.local = true;

							var new_asset = {

								local: true,
								name: "asset",
								expanded: true,
								hardware_checklist_arr: [{
									name: "hardware_checklist",
									expanded: true,
									table_data: null,
									sub_asset_arr: [{
										name: "sub_asset",
										expanded: true,
										table_data: null,
										sub_asset_arr: [],
									}],
								}],
								table_data: {
									fields: _state.default_filed_hash[ "Asset_C__c" ].fields,
									record_id_arr: [ new_record[ "Id" ] ]
								},

							};

							console.log( "new_asset", new_asset );

							zone_model.record_arr.push( new_record );
							zone_model.record_hash[ new_record[ "Id" ] ] = new_record;

							zone.asset_arr.push( new_asset );

							// push changes to the change object

							var change_object = this.ensure_change_object( record_id );

							// delete change_object[ "Id" ];

							change_object.local = true;

							change_object.Type = "Insert";
							change_object.objectName = "Asset_C__c";
							change_object.Zone__c = zone.zone_data[ "Id" ];
							change_object.Service_Work_Order__c = _model.report_model.record_id;
							change_object.Work_Order__c = _model.report_model.record_id;

							_app.log( "change_object", change_object );
							_model.hasRecordChange=true;
							//this.save_changes_to_storage();
							setTimeout(function(){
								if(document.getElementsByClassName(change_object.Zone__c+"_"+record_id).length>0)
									document.getElementsByClassName(change_object.Zone__c+"_"+record_id)[0].scrollIntoView();
							},200)
							

						},
						new_all_HC_button_click: function ( zone_model, zone ) {
							_model.record_details_mode = "edit";
							zone.expanded=true;
							
							if(zone.asset_arr!=undefined){
								for(var i in zone.asset_arr){
									var asset=zone.asset_arr[i];

									for(var j in asset.hardware_checklist_arr){
										var hardware_checklist=asset.hardware_checklist_arr[j];
									
										var new_record = {};
										var record_id = (i+1)+''+ Date.now();
										new_record[ "Id" ] = record_id;
										new_record.local = true;

										var fieldList= _state.default_hc_recordtypewise_field[zone_model.record_hash[asset.table_data.record_id_arr[ 0 ]].RecordType.Name];
										// add all field as blank value
										for(var l in fieldList){
											new_record[fieldList[l].name]='';
										}


										zone_model.record_arr.push( new_record );
										zone_model.record_hash[ record_id ] = new_record;
										if ( hardware_checklist.table_data === null ) {

											hardware_checklist.table_data = {
												record_id_arr: [],
												fields:fieldList
											};

										};
										if(hardware_checklist.table_data.record_id_arr.length>=1){
											break;
										}
										var ZoneData=_model.report_model.zone_model.zone_arr;
										for(var i in ZoneData){
											var AssetData=ZoneData[i].asset_arr;
											for(var j in AssetData){
												if(AssetData[j].table_data!=undefined &&  asset.table_data!=undefined  ){
													if(AssetData[j].table_data.record_id_arr[ 0 ]==asset.table_data.record_id_arr[ 0 ]){
														var HCData=AssetData[j].hardware_checklist_arr;
														for(var k in HCData){
															if ( HCData[k].table_data === null ) {

																HCData[k].table_data = {
																	record_id_arr: [],
																	fields: fieldList
																};
																
															};
															HCData[k].table_data.record_id_arr.unshift( record_id )


														}
													}
												}
												
											} 

										} 

										//hardware_checklist.table_data.record_id_arr.unshift( record_id )

										// push changes to the change object

										var change_object = this.ensure_change_object( record_id );

										// change_object.local = asset.local;

										change_object.Type = "Insert";
										change_object.objectName = "Hardware_Checklist__c";
										change_object.Asset_C__c = asset.table_data.record_id_arr[ 0 ];
										change_object.Work_Order__c = _model.report_model.record_id;
										change_object.recordTypeId = _state.recordTypeIdByNameHC[zone_model.record_hash[asset.table_data.record_id_arr[ 0 ]].RecordType.Name];
										

										_app.log( "change_object", change_object );
										_model.hasRecordChange=true;
										//this.save_changes_to_storage();
									}

								}

							}
							

						},
						new_HC_button_click: function ( zone_model, zone, asset,hardware_checklist ) {

							_model.record_details_mode = "edit";

							var new_record = {};
							var record_id = Date.now();
							new_record[ "Id" ] = record_id;
							new_record.local = true;

							var fieldList= _state.default_hc_recordtypewise_field[zone_model.record_hash[asset.table_data.record_id_arr[ 0 ]].RecordType.Name];
							// add all field as blank value
							for(var l in fieldList){
								new_record[fieldList[l].name]='';
							}


							zone_model.record_arr.push( new_record );
							zone_model.record_hash[ record_id ] = new_record;
							if ( hardware_checklist.table_data === null ) {

								hardware_checklist.table_data = {
									record_id_arr: [],
									fields:fieldList
								};

							};
							
							var ZoneData=_model.report_model.zone_model.zone_arr;
							for(var i in ZoneData){
								var AssetData=ZoneData[i].asset_arr;
								for(var j in AssetData){
									if(AssetData[j].table_data!=undefined &&  asset.table_data!=undefined  ){
												
										if(AssetData[j].table_data.record_id_arr[ 0 ]==asset.table_data.record_id_arr[ 0 ]){
											var HCData=AssetData[j].hardware_checklist_arr;
											for(var k in HCData){
												if ( HCData[k].table_data === null ) {

													HCData[k].table_data = {
														record_id_arr: [],
														fields: fieldList
													};
													
												};
												HCData[k].table_data.record_id_arr.unshift( record_id )


											}
										}
									}
									
								} 

							} 

							//hardware_checklist.table_data.record_id_arr.unshift( record_id )

							// push changes to the change object

							var change_object = this.ensure_change_object( record_id );

							// change_object.local = asset.local;

							change_object.Type = "Insert";
							change_object.objectName = "Hardware_Checklist__c";
							change_object.Asset_C__c = asset.table_data.record_id_arr[ 0 ];
							change_object.Work_Order__c = _model.report_model.record_id;
							change_object.recordTypeId = _state.recordTypeIdByNameHC[zone_model.record_hash[asset.table_data.record_id_arr[ 0 ]].RecordType.Name];
							

							_app.log( "change_object", change_object );
							_model.hasRecordChange=true;
							//this.save_changes_to_storage();

						},

						new_sub_asset_button_click: function ( zone_model, zone, asset, sub_asset ) {
							sub_asset.expanded=true;
							_model.record_details_mode = "edit";

							var new_record = {};
							var record_id = Date.now();
							new_record[ "Id" ] = record_id;
							new_record.local = true;

							zone_model.record_arr.push( new_record );
							zone_model.record_hash[ record_id ] = new_record;

							if ( sub_asset.table_data === null ) {

								sub_asset.table_data = {
									record_id_arr: [],
									fields: _state.default_filed_hash[ "Sub_Asset__c" ].fields
								};

							};

							sub_asset.table_data.record_id_arr.unshift( record_id )

							// push changes to the change object

							var change_object = this.ensure_change_object( record_id );

							// change_object.local = asset.local;

							change_object.Type = "Insert";
							change_object.objectName = "Sub_Asset__c";
							change_object.Zone__c = zone.zone_data[ "Id" ];
							change_object.Asset__c = asset.table_data.record_id_arr[ 0 ];
							change_object.Service_Work_Order__c = _model.report_model.record_id;
							change_object.Work_Order__c = _model.report_model.record_id;

							_app.log( "change_object", change_object );
							_model.hasRecordChange=true;
							//this.save_changes_to_storage();

						},
						loadTextFromFile(ev) {
							const file = ev.target.files[0];
							const reader = new FileReader();
					  
							reader.onload = function(e){
								var importData=JSON.parse(e.target.result );
								chrome.storage.local.get(null, function(items) {
									if(importData!=undefined && importData.reports!=undefined){
										for (var recordId in importData.reports) {
											items.reports[recordId]=importData.reports[recordId];
										}
									}
									if(importData!=undefined && importData.HCChartDataArr!=undefined){
										for (var recordId in importData.HCChartDataArr) {
											items.HCChartDataArr[recordId]=importData.HCChartDataArr[recordId];
										}
									}
									if(importData!=undefined && importData.reports_diffs!=undefined){
										for (var recordId in importData.reports_diffs) {
											items.reports_diffs[recordId]=importData.reports_diffs[recordId];
										}
									}
									chrome.storage.local.set(items);
									location.reload();
								});

								
								

							} 
							reader.readAsText(file);
						},
						loadEPTextFromFile(ev) {
							const file = ev.target.files[0];
							const reader = new FileReader();
					  
							reader.onload = function(e){
								var importData=JSON.parse(e.target.result );
								
								var response = _app.x.bg_api.exec( "main", "importFileEP", importData);

							} 
							reader.readAsText(file);
						},

						button_click: async ( button_name ) => {

							if ( button_name === "remove_synced_records" ) {

								_app.x.bg_api.exec( "main", "remove_synced_records" );

							} else if ( button_name === "update_records" ) {

								_app.x.bg_api.exec( "main", "update_records" );

							} else if ( button_name === "modal_return_to_page" ) {

								_model.modal_dialog_model.active = false;

							} else if ( button_name === "log_in" ) {

								_app.x.bg_api.exec( "main", "launch_web_auth_flow" );

							} else if ( button_name === "log_out" ) {

								_app.x.bg_api.exec( "main", "log_out" );

								_model.user_info.logged_in = false;

								_model.modal_dialog_model.active_card_name = "logged_out";
								_model.modal_dialog_model.active = true;

							} else if ( button_name === "upload_attachment" ) {


							} else if ( button_name === "View_YES" ) {

								var storage = await _app.x.chrome_p.storage.local.get([ "SFViewModel" ]);
								storage.SFViewModel="EP" ;
								chrome.storage.local.set( storage );
								location.reload();

							} else if ( button_name === "View_NO" ) {

								var storage = await _app.x.chrome_p.storage.local.get([ "SFViewModel" ]);
								storage.SFViewModel="Fire" ;
								chrome.storage.local.set( storage );
								location.reload();

							} else if ( button_name === "resetMode" ) {

								var storage = await _app.x.chrome_p.storage.local.get([ "SFViewModel" ]);
								storage.SFViewModel="" ;
								chrome.storage.local.set( storage );
								location.reload();

							}  else if ( button_name === "switchMode" ) {
								var storage = await _app.x.chrome_p.storage.local.get([ "SFViewModel" ]);
								if(storage.SFViewModel=='Fire'){
									storage.SFViewModel="EP" ;
								}else{
									storage.SFViewModel="Fire" ;
								}
								chrome.storage.local.set( storage );
								location.reload();

							} else if ( button_name === "edit_record_details" ) {

								_model.record_details_mode = "edit";

							} else if ( button_name === "save_record_details" ) {

								chrome.storage.local.set( _state.storage );

								_model.record_details_mode = "read";

							} else if ( button_name === "export_records" ) {

								chrome.storage.local.get(null, function(items) {
									var exportData={};
									exportData.reports={};
									exportData.reports=items.reports;
									exportData.reports_diffs={};
									exportData.reports_diffs=items.reports_diffs;
									exportData.HCChartDataArr={};
									exportData.HCChartDataArr=items.HCChartDataArr;
									var blob = new Blob([JSON.stringify(exportData)], {type: "text/plain;charset=utf-8"});
									saveAs(blob, "FikeData.txt");
								});
							
							}
							
							else if ( button_name === "menu_button" ) {

								$( "#drawer_overlay" ).css( "display", "block" );

								webextension_library.util.wait( 1 )
								.then( () => {

									$( "#drawer_overlay" ).get( 0 ).classList.add( "opened" );

								});

							}else if ( button_name === "edit_report" ){
								_model.record_details_mode = "edit";
							

							} else if ( button_name === "cancel_edit" ) {

								//chrome.storage.local.set( _state.storage );

								_model.record_details_mode = "read";

							} else if ( button_name === "save_report" ){


								// Engineers Hours Validation
								var requiredFieldMissing=false;
								var fieldName='';
								var ServiceEntry=_model.report_model.Service_Time_Entry__c;
								for(var i in ServiceEntry){
									for(var j in ServiceEntry[i]){
										var EH=ServiceEntry[i][j];
										if(EH.isRequired){
											if(EH.value==undefined || EH.value==null || EH.value==''){
												fieldName=EH.label;
												requiredFieldMissing=true;
											}
										}
									}
								}
								if(requiredFieldMissing){
									alert(fieldName+' Field Required in Engineers Hours');
									return;
								}

								// Material Validation
								var keyInfo=_model.report_model.ProductItem;
								for(var i in keyInfo){
									for(var j in keyInfo[i]){
										var KI=keyInfo[i][j];
										if(KI.isRequired){
											if(KI.value==undefined || KI.value==null || KI.value=='' ){
												var checkValidation=true;
												if(KI.name=='OwnerId'){
													for(var k in keyInfo[i]){
														if(keyInfo[i][k].name=='Fike_Stock__c' && keyInfo[i][k].value!=true){
															checkValidation=false;
														}
													}
												}
												if(checkValidation){
													fieldName=KI.label;
													requiredFieldMissing=true;
													break;
												}
											}
										}
									}
									if(requiredFieldMissing){
										break;
									}
								}
								if(requiredFieldMissing){
									alert(fieldName+ ' Field Required in Material');
									return;
								}


								// chrome.storage.local.set( _state.storage );

								_model.record_details_mode = "read";

								
								// added to sync on main screen when any data update
								_model.reports_array[_model.report_model.record_id]=_model.report_model;

								/* Added to Save data on edit save click */
								var storage = await _app.x.chrome_p.storage.local.get([ "reports_diffs", "reports" ]);

								storage.reports_diffs = _model.changes_in_report_model;

								// _model.reports_array[_model.report_model.record_id].status_data.edited_status = 'edited';
								// _model.reports_array[_model.report_model.record_id].status_data.edited = true;

								var status_data = {

									child_edited: true,
									edited: true,
									edited_and_synced: false,
									edited_status: "edited",
									sync_status: { name: "no_info" }

								};

								_model.reports_array[_model.report_model.record_id].status_data = status_data;
								_model.report_model.status_data = status_data;

								// Vue.set( _model.report_model, "status_data", status_data );

								console.log( "save_changes_to_storage", _model.report_model.status_data );

								storage.reports[_model.report_model.record_id] = JSON.parse(JSON.stringify(_model.report_model));

								chrome.storage.local.set( storage );
								/* Added to Save data at last */
								
							}

						},

						set_active_page_name: ( page_name ) => {

							
							_priv.set_active_page_name( page_name );

						},

						expand_all_zone_model: function ( zone_model ) {

							zone_model.zone_arr.forEach( ( zone ) => {

								zone.expanded = true;

								zone.asset_arr.forEach( ( asset ) => {

									asset.expanded = true;

									asset.hardware_checklist_arr.forEach( ( hardware_checklist ) => {

										hardware_checklist.expanded = true;

										hardware_checklist.sub_asset_arr.forEach( ( sub_asset ) => {

											sub_asset.expanded = true;

										});

									});

								});

							});

						},

						collapse_all_zone_model: function ( zone_model ) {

							zone_model.zone_arr.forEach( ( zone ) => {

								zone.expanded = false;

								zone.asset_arr.forEach( ( asset ) => {

									asset.expanded = false;

									asset.hardware_checklist_arr.forEach( ( hardware_checklist ) => {

										hardware_checklist.expanded = false;

										hardware_checklist.sub_asset_arr.forEach( ( sub_asset ) => {

											sub_asset.expanded = false;

										});

									});

								});

							});

						},

						rearrange_for_pdf_unbreakable: async () => {

							var page_count = 0;
							var page_height = 1270;
							var page_height = 1255;
							var page_height = 1257.5;
							var current_height = 0;

							var elements = $( ".pdf-unbreakable" );

							for ( var i = 0; i < elements.length; i++ ) {

								var element = $( elements[ i ] );
								var from_page_top_to_element_bottom = element.get( 0 ).offsetTop - page_count * page_height + element.height();
								var from_page_start_to_element_top = element.get( 0 ).offsetTop - page_count * page_height;

								// console.log( "h", element[ 0 ], from_page_start_to_element_top, element.height(), from_page_top_to_element_bottom )

								if ( from_page_top_to_element_bottom > page_height ) {

									// console.log( from_page_top_to_element_bottom );

									element.before( `<div class = "pdf-spacer" style = 'background-color:white; height:${ page_height - from_page_start_to_element_top }px; min-height: 10px' ></div>`);

									// element.css( "margin-top",  );

									page_count += 1;
									current_height = from_page_top_to_element_bottom;

									await _app.x.util.wait( 100 );

								} else {

									current_height = from_page_top_to_element_bottom;

								};

							};

						},

						export_report_to_pdf: async function () {

							_model.record_details_mode = "read";
							_model.pdf_active = 1;

							var that = this;
							$('.accordion-title').each(function(){
								that.accordion_section_visibility($(this), 0, true)
							});

							$('.element-to-print').each(function(){
								$(this).css("display", "block");
							});

							$('.element-to-hide').each(function(){
								$(this).css("display", "none");
							});

						

							$('.record_details .card').css('border', '0');

							$('.header').each(function(){
								$(this).css("display", "none");
							});
							$('body').each(function(){
								$(this).css("overflow", "unset");
							});
							$('.page_container').each(function(){
								$(this).css("overflow", "unset");
							});
							$('#record_details_card').each(function(){
								$(this).css("margin", "0px");
								$(this).css("padding", "12px");
								$(this).css("border", "0px solid rgb(221, 219, 218);");
							});
							$('.report-button').each(function(){
								$(this).css("display", "none");
							});

							$('.background_image').each(function(){
								$(this).css("display", "none");
							});
							
							
							
							this.expand_all_zone_model( _model.report_model.zone_model );

							setTimeout(function(){
								//printJS('record_details', 'html')
								/*var divContents = $("#record_details").html();
								var printWindow = window.open('', '', 'height=400,width=800');
								printWindow.document.write('<html><head><title>DIV Contents</title>');
								printWindow.document.write('</head><body >');
								printWindow.document.write(divContents);
								printWindow.document.write('</body></html>');
								printWindow.document.close();
								printWindow.print();*/
									window.print()
									$('.page_container').each(function(){
										$(this).css("overflow", "auto");
									});
									$('body').each(function(){
										$(this).css("overflow", "hidden");
									});
									$('.element-to-print').each(function(){
										$(this).css("display", "none");
									});
		
									$('.element-to-hide').each(function(){
										$(this).css("display", "");
									});
		
								
									$('.header').each(function(){
										$(this).css("display", "");
									});
									$('#record_details_card').each(function(){
										$(this).css("margin", "12px");
										$(this).css("padding", "0px");
										$(this).css("border", "1px solid rgb(221, 219, 218);");
									});
									$('.report-button').each(function(){
										$(this).css("display", "");
									});
									$('.background_image').each(function(){
										$(this).css("display", "");
									});
									$('.record_details .card').css('border', '1px solid rgb(221, 219, 218)');
		
									$( ".pdf-spacer" ).remove();
							},1000);
						
						/*	_model.record_details_mode = "read";
							_model.pdf_active = 1;

							var that = this;
							$('.accordion-title').each(function(){
								that.accordion_section_visibility($(this), 0, true)
							});

							$('.element-to-print').each(function(){
								$(this).css("display", "block");
							});

							$('.element-to-hide').each(function(){
								$(this).css("display", "none");
							});

							$('.record_details .card').css('border', '0');

							var element = $('.record_details');
							var maxHeight = 1000;
							var summaryHeight = 0;
							var page = 1;

							this.expand_all_zone_model( _model.report_model.zone_model );

							await _app.x.util.wait( 200 );

							await this.rearrange_for_pdf_unbreakable();

							setTimeout(() => {

								// element.find('.report-table, .field_item, .section_headin, .section_2').each(function(){
								// 	$(this).each(function () {
								// 		var currentElement = $(this);
								// 		if (currentElement.find('.accordion-title, .accordion-section').length > 0){
								// 			$(this).find('.accordion-title, .accordion-section').each(function () {
								// 				var currentElement = $(this);
								// 				if ((summaryHeight + currentElement.outerHeight(true)) >= (page === 1 ? maxHeight - 100 : maxHeight) ) {
								// 					currentElement.addClass('after');
								// 					summaryHeight = 0;
								// 					page++;
								// 				}else {
								// 					summaryHeight += currentElement.outerHeight(true);
								// 				}
								// 			})
								// 		}else{
								// 			if ((summaryHeight + currentElement.outerHeight(true)) >= (page === 1 ? maxHeight - 100 : maxHeight) ) {
								// 				currentElement.addClass('after');
								// 				summaryHeight = 0;
								// 				page++;
								// 			}else {
								// 				summaryHeight += currentElement.outerHeight(true);
								// 			}
								// 		}
								// 	})
								// });
								
								var pagebreak = { mode: '', before: '.before', after: '.after', avoid: '.avoid' };

								var opt = {
									margin:			 .2,
									image:				{ type: 'jpeg', quality: 1 },
									html2canvas: {},
									jsPDF:				{ unit: 'in', format: [ 13.5, 12.5 ], orientation: 'portrait', scale: 4,  compressPdf: true },
									pagebreak: 		pagebreak,
									return: true
								};

								this.$nextTick(() => {

									html2pdf().set(opt).from(element.html()).toPdf().get('pdf').then((file) => {

										var today = new Date();
										var date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate();

										$('.element-to-print').each(function(){
											$(this).css("display", "none");
										});

										$('.element-to-hide').each(function(){
											$(this).css("display", "");
										});

										$('.record_details .card').css('border', '1px solid rgb(221, 219, 218)');

										$( ".pdf-spacer" ).remove();

										_model.pdf_active = 0;

										// this.collapse_all_zone_model( _model.report_model.zone_model );

										var openedPDF = window.open(file.output('bloburl'), '_blank');

									});

								  // html2canvas(element.get( 0 )).then( ( canvas ) => {

								  //         //Returns the image data URL, parameter: image format and clarity (0-1)
								  //         var pageData = canvas.toDataURL('image/jpeg', 1.0);

								  //         //Default vertical direction, size ponits, format a4[595.28,841.89]
								  //         var pdf = new jsPDF('', 'pt', 'a4');

								  //         //Two parameters after addImage control the size of the added image, where the page height is compressed according to the width-height ratio column of a4 paper.
								  //         pdf.addImage(pageData, 'JPEG', 0, 0, 595.28, 592.28/canvas.width * canvas.height );

								  //         var result = pdf.save('stone.pdf');

								  //         console.log( result );

								  // })

								});

							}, 1000 );*/
						},
						export_report_to_pdf_short: async function () {
							
							_model.record_details_mode = "read";
							_model.pdf_active = 1;

							var that = this;
							$('.accordion-title').each(function(){
								that.accordion_section_visibility($(this), 0, true)
							});

							$('.element-to-print').each(function(){
								$(this).css("display", "block");
							});

							$('.element-to-hide').each(function(){
								$(this).css("display", "none");
							});

							$('.hide-sub-assets').each(function(){
								$(this).css("display", "none");
							});

							$('.record_details .card').css('border', '0');

							$('.header').each(function(){
								$(this).css("display", "none");
							});
							$('body').each(function(){
								$(this).css("overflow", "unset");
							});
							$('.page_container').each(function(){
								$(this).css("overflow", "unset");
							});
							$('#record_details_card').each(function(){
								$(this).css("margin", "0px");
								$(this).css("padding", "12px");
								$(this).css("border", "0px solid rgb(221, 219, 218);");
							});
							$('.report-button').each(function(){
								$(this).css("display", "none");
							});

							$('.background_image').each(function(){
								$(this).css("display", "none");
							});
							
							
							
							this.expand_all_zone_model( _model.report_model.zone_model );

							setTimeout(function(){
								//printJS('record_details', 'html')
								/*var divContents = $("#record_details").html();
								var printWindow = window.open('', '', 'height=400,width=800');
								printWindow.document.write('<html><head><title>DIV Contents</title>');
								printWindow.document.write('</head><body >');
								printWindow.document.write(divContents);
								printWindow.document.write('</body></html>');
								printWindow.document.close();
								printWindow.print();*/
									window.print()
									$('.page_container').each(function(){
										$(this).css("overflow", "auto");
									});
									$('body').each(function(){
										$(this).css("overflow", "hidden");
									});
									$('.element-to-print').each(function(){
										$(this).css("display", "none");
									});
		
									$('.element-to-hide').each(function(){
										$(this).css("display", "");
									});
		
									$('.hide-sub-assets').each(function(){
										$(this).css("display", "");
									});
									$('.header').each(function(){
										$(this).css("display", "");
									});
									$('#record_details_card').each(function(){
										$(this).css("margin", "12px");
										$(this).css("padding", "0px");
										$(this).css("border", "1px solid rgb(221, 219, 218);");
									});
									$('.report-button').each(function(){
										$(this).css("display", "");
									});
									$('.background_image').each(function(){
										$(this).css("display", "");
									});
									$('.record_details .card').css('border', '1px solid rgb(221, 219, 218)');
		
									$( ".pdf-spacer" ).remove();
							},1000);
						
							
						},
						export_report_to_pdf_short_report: async function () {
							
							_model.record_details_mode = "read";
							_model.pdf_active = 1;

							var that = this;
							_model.shortReport={};
							
							let nededFields = ["WorkOrderNumber","Customer_WO__c","AccountId", "Site_Address__c", "WorkTypeId", "Subject", "Description", "Responsible_Service_Engineeer__c",  "Status"];
							let fieldForOutput = [];
							let allFields=_model.report_model.WorkOrder[0];
							
							for (var fieldKey in allFields){
								if(allFields[fieldKey].name=='WorkOrderNumber'){
									_model.shortReport.WorkOrderNumber=allFields[fieldKey];
									continue;
								}
								if (nededFields.indexOf(allFields[fieldKey].name) !== -1){
									
									fieldForOutput.push(allFields[fieldKey]);
								}
							}
							_model.shortReport.WOSeciton=fieldForOutput;
							_model.shortReport.WorkOrder=_model.report_model.WorkOrder[0];
							let allWOZONE=_model.report_model.Work_Order_Zone__c;
							let WOZONEForOutput = [];
							for (var fieldKey in allWOZONE){
								var isFailed=false;
								for (var row in allWOZONE[fieldKey]){
									if(allWOZONE[fieldKey][row].name=='Service_Status__c' && allWOZONE[fieldKey][row].value=='Fail'){
										isFailed=true;
									}
								}
								WOZONEForOutput.push({hasFailedStatus:isFailed,rowData:allWOZONE[fieldKey]});
							}

							
							_model.shortReport.WOZoneSeciton=WOZONEForOutput;

							_model.shortReport.Short_Report =(_model.report_model.WorkOrder!=null && _model.report_model.WorkOrder[0]!=null)?_model.report_model.WorkOrder[0].Short_Report__c:'';
							
							/*var STESection=[];
							var allSTE=_model.report_model.Service_Time_Entry__c;
							var changeOrder;
							var changeOrderKey;
							for (var fieldKey in allSTE){
								var arrangeData={};
								for (var row in allSTE[fieldKey]){
									if(allSTE[fieldKey][row].name=='Change_Order__c'){
										changeOrder=allSTE[fieldKey][row];
										changeOrderKey=row;
										continue;
									}
									arrangeData[row]=allSTE[fieldKey][row];
								}
								arrangeData[changeOrderKey]=changeOrder;
								STESection.push(arrangeData);
							}*/

							_model.shortReport.ServiceTimeEntry=_model.report_model.Service_Time_Entry__c;
							
							_model.shortReport.MaterialSeciton=_model.report_model.ProductItem;
							
							_model.record_details_mode = "read";
							_model.pdf_active = 1;

							var that = this;
							$('.accordion-title').each(function(){
								that.accordion_section_visibility($(this), 0, true)
							});
							$('#reportPage').css("display", "none");
							$('#shortPDF').css("display", "block");
								

							$('.element-to-print').each(function(){
								$(this).css("display", "block");
							});

							$('.element-to-hide').each(function(){
								$(this).css("display", "none");
							});

							$('.hide-sub-assets').each(function(){
								$(this).css("display", "none");
							});

							$('.record_details .card').css('border', '0');

							$('.header').each(function(){
								$(this).css("display", "none");
							});
							$('body').each(function(){
								$(this).css("overflow", "unset");
							});
							$('.page_container').each(function(){
								$(this).css("overflow", "unset");
							});
							$('#record_details_card').each(function(){
								$(this).css("margin", "0px");
								$(this).css("padding", "12px");
								$(this).css("border", "0px solid rgb(221, 219, 218);");
							});
							$('.report-button').each(function(){
								$(this).css("display", "none");
							});

							$('.background_image').each(function(){
								$(this).css("display", "none");
							});
							
							document.title = 'Fike Field Service-'+ _model.shortReport.WorkOrderNumber.value +'-'+new Date().toISOString().slice(0,10);
							setTimeout(function(){
								
									window.print()
									document.title = 'Fike Field Service ';
									$('.page_container').each(function(){
										$(this).css("overflow", "auto");
									});
									$('body').each(function(){
										$(this).css("overflow", "hidden");
									});
									$('.element-to-print').each(function(){
										$(this).css("display", "none");
									});
									$('#reportPage').css("display", "block");
									$('#shortPDF').css("display", "none");
		
									$('.element-to-hide').each(function(){
										$(this).css("display", "");
									});
		
									$('.hide-sub-assets').each(function(){
										$(this).css("display", "");
									});
									$('.header').each(function(){
										$(this).css("display", "");
									});
									$('#record_details_card').each(function(){
										$(this).css("margin", "12px");
										$(this).css("padding", "0px");
										$(this).css("border", "1px solid rgb(221, 219, 218);");
									});
									$('.report-button').each(function(){
										$(this).css("display", "");
									});
									$('.background_image').each(function(){
										$(this).css("display", "");
									});
									$('.record_details .card').css('border', '1px solid rgb(221, 219, 218)');
		
									$( ".pdf-spacer" ).remove();
							},1000);
							
						},

						export_report_to_pdf_medium_report: async function (isMediumReport) {
							_model.report_type = isMediumReport==true?'Medium':'Long';
							
							_model.record_details_mode = "read";
							_model.pdf_active = 1;

							var that = this;
							_model.shortReport={};
							
							let nededFields = ["WorkOrderNumber","Customer_WO__c","AccountId", "Site_Address__c", "WorkTypeId", "Subject", "Description", "Responsible_Service_Engineeer__c",  "Status"];
							let fieldForOutput = [];
							let allFields=_model.report_model.WorkOrder[0];
							
							for (var fieldKey in allFields){
								if(allFields[fieldKey].name=='WorkOrderNumber'){
									_model.shortReport.WorkOrderNumber=allFields[fieldKey];
									continue;
								}
								if (nededFields.indexOf(allFields[fieldKey].name) !== -1){
									
									fieldForOutput.push(allFields[fieldKey]);
								}
							}
							_model.shortReport.WOSeciton=fieldForOutput;
							_model.shortReport.WorkOrder=_model.report_model.WorkOrder[0];
							let allWOZONE=_model.report_model.Work_Order_Zone__c;
							let WOZONEForOutput = [];
							for (var fieldKey in allWOZONE){
								var isFailed=false;
								for (var row in allWOZONE[fieldKey]){
									if(allWOZONE[fieldKey][row].name=='Service_Status__c' && allWOZONE[fieldKey][row].value=='Fail'){
										isFailed=true;
									}
								}
								WOZONEForOutput.push({hasFailedStatus:isFailed,rowData:allWOZONE[fieldKey]});
							}

							
							_model.shortReport.WOZoneSeciton=WOZONEForOutput;

							_model.shortReport.Short_Report =(_model.report_model.WorkOrder!=null && _model.report_model.WorkOrder[0]!=null)?_model.report_model.WorkOrder[0].Short_Report__c:'';
							
							/*var STESection=[];
							var allSTE=_model.report_model.Service_Time_Entry__c;
							var changeOrder;
							var changeOrderKey;
							for (var fieldKey in allSTE){
								var arrangeData={};
								for (var row in allSTE[fieldKey]){
									if(allSTE[fieldKey][row].name=='Change_Order__c'){
										changeOrder=allSTE[fieldKey][row];
										changeOrderKey=row;
										continue;
									}
									arrangeData[row]=allSTE[fieldKey][row];
								}
								arrangeData[changeOrderKey]=changeOrder;
								STESection.push(arrangeData);
							}*/

							_model.shortReport.ServiceTimeEntry=_model.report_model.Service_Time_Entry__c;
							
							_model.shortReport.MaterialSeciton=_model.report_model.ProductItem;
							
							_model.record_details_mode = "read";
							_model.pdf_active = 1;

							let WOZoneSecion=_model.report_model.Work_Order_Zone__c;
							let zoneSecion=_model.report_model.Zone__c;

							var that = this;
							_model.mediumReport={};
							_model.mediumReport.Zone__c=[];
							
							var WOZone={};
							// read Work order zone 
							for (var index in WOZoneSecion){
								var zone_status={};
								var zoneName;
								for (var fieldKey in WOZoneSecion[index]){
									if(WOZoneSecion[index][fieldKey].name=='Zone__c'){
										zoneName=WOZoneSecion[index][fieldKey].value;
									}
									zone_status[WOZoneSecion[index][fieldKey].name]=WOZoneSecion[index][fieldKey].value;
								}
								WOZone[zoneName]=zone_status;
							}

							/*for (var index in zoneSecion){
								var assets=[];
								var zone={};
								for (var fieldKey in zoneSecion[index]){
									if(zoneSecion[index][fieldKey].name=='Name'){
										zone=WOZone[WOZoneSecion[index][fieldKey].value]=WOZoneSecion[index];
									}
									
									if(fieldKey=='_Asset_c__c'){
										assets=zoneSecion[index][fieldKey];
									}
								}
								zone['Id']=zoneSecion[index].Id;
								zone['_Asset_c__c']=assets;
								_model.mediumReport.Zone__c.push(zone);
							}*/
							var filterFieldName=["Equipment_Type__c","Size1__c","Customer_Tag_No__c","Name","Serial__c"];
							var updatedLabel=["Type","Size","Cust Tag","Fike Tag","Serial No"];
							
							var subAssetFieldName=["Quantity__c","Part_Number__c","Description__c","Serial_Lot_Number__c","Expiry_Date__c"];
							var subAssetFieldLabel=["Quantity","Part #","Description","Serial/Lot Number","Expiry Date"];
							

							var zone_model=JSON.parse( JSON.stringify( _model.report_model.zone_model.zone_arr ) );
							var assetWiseSubAsset={};
							var ZoneDetails=[];
							for (var index in zone_model){
								var asset_HC_arr=[];
								var zoneRec={};
								for (var asset_index in zone_model[index].asset_arr){

									if(zone_model[index].asset_arr[asset_index].table_data!=undefined){
										// Assets
										var asset_HC_data={}
										var asset_HC_fields=[];
										var assetFields=zone_model[index].asset_arr[asset_index].table_data.fields;
										var assetRecId=zone_model[index].asset_arr[asset_index].table_data.record_id_arr[0];
										var assetRec=_model.report_model.zone_model.record_hash[assetRecId];
									
										var cnt=1;
										//fiter asset Field
										var updatedAssetFields=[];
										for (var field_index in assetFields){
											
											if(_model.SFViewModel!="Fire" && filterFieldName.indexOf(assetFields[field_index].name)!=-1){
												var data=assetFields[field_index];
												data.value=assetRec[assetFields[field_index].name];
												data.label=updatedLabel[filterFieldName.indexOf(assetFields[field_index].name)];
												data.order=filterFieldName.indexOf(assetFields[field_index].name);
												asset_HC_fields.push(data);
											}
											if(_model.SFViewModel=="Fire" && cnt<=5){
												var data=assetFields[field_index];
												data.value=assetRec[assetFields[field_index].name];
												//data.label=updatedLabel[filterFieldName.indexOf(assetFields[field_index].name)];
												data.order=cnt;
												asset_HC_fields.push(data);
												cnt++;
											}
											
										}
										var asset_HC_fields = asset_HC_fields.sort(function(a, b){return a.order-b.order});
					
										//asset_HC_arr.push(asset_HC_fields);

										if(zone_model[index].asset_arr[asset_index].hardware_checklist_arr!=undefined && zone_model[index].asset_arr[asset_index].hardware_checklist_arr.length>0){
											if(zone_model[index].asset_arr[asset_index].hardware_checklist_arr[0].table_data!=undefined){
												// Hardware Checklist
												var HCFields=zone_model[index].asset_arr[asset_index].hardware_checklist_arr[0].table_data.fields;
												var HCRecId=zone_model[index].asset_arr[asset_index].hardware_checklist_arr[0].table_data.record_id_arr[0];
												var HCRec=_model.report_model.zone_model.record_hash[HCRecId];
											
												for (var field_index in HCFields){
													HCFields[field_index].value=HCRec==undefined ? '' :HCRec[HCFields[field_index].name];
													HCFields[field_index].isZoneField=true;
													asset_HC_fields.push(HCFields[field_index]);
												}
												asset_HC_data.HCId=HCRecId;
												
												// sub Assets
												if(zone_model[index].asset_arr[asset_index].hardware_checklist_arr[0].sub_asset_arr!=undefined && zone_model[index].asset_arr[asset_index].hardware_checklist_arr[0].sub_asset_arr.length>0){
													var sub_assetRecs=zone_model[index].asset_arr[asset_index].hardware_checklist_arr[0].sub_asset_arr;
													var subAssets=[];
													for(var k=0;k<sub_assetRecs.length;k++){
														if(sub_assetRecs[k].table_data!=undefined && sub_assetRecs[k].table_data.fields!=undefined){
															var subAssField=[];
															for(var j=0;j<sub_assetRecs[k].table_data.fields.length;j++){
																if(subAssetFieldName.indexOf(sub_assetRecs[k].table_data.fields[j].name)!=-1){
																	sub_assetRecs[k].table_data.fields[j].order=subAssetFieldName.indexOf(sub_assetRecs[k].table_data.fields[j].name);
																	sub_assetRecs[k].table_data.fields[j].label=subAssetFieldLabel[subAssetFieldName.indexOf(sub_assetRecs[k].table_data.fields[j].name)];
																	subAssField.push(sub_assetRecs[k].table_data.fields[j]);
																}
															}
															if(isMediumReport && sub_assetRecs[k].table_data.record_id_arr!=undefined){
																var listSubAssRecIds=[];
																for(var i=0;i<sub_assetRecs[k].table_data.record_id_arr.length;i++){
																	var rec=_model.report_model.zone_model.record_hash[ sub_assetRecs[k].table_data.record_id_arr[i] ] ;
																	if ( rec ) {
																		if(rec.Expiry_Date__c!=undefined ){
																			if(moment(rec.Expiry_Date__c, 'YYYY-MM-DD').toDate() <moment().toDate() || (moment(rec.Expiry_Date__c, 'YYYY-MM-DD').toDate() < moment().add(12, 'M').toDate())){
																				listSubAssRecIds.push(sub_assetRecs[k].table_data.record_id_arr[i]);
																			}
																		}
																	} 
																}
																sub_assetRecs[k].table_data.record_id_arr=listSubAssRecIds;
															}
															sub_assetRecs[k].table_data.fields=subAssField.sort(function(a, b){return a.order-b.order});
															subAssets.push(sub_assetRecs[k]);
															
														}
													}
													if(assetWiseSubAsset[assetRecId]!=undefined && assetWiseSubAsset[assetRecId].length>0){
														if(subAssets!=undefined && subAssets.length>0){

															for(var i=0;i<assetWiseSubAsset[assetRecId][0].table_data.record_id_arr.length;i++){
																if(subAssets[0].table_data.record_id_arr.indexOf(assetWiseSubAsset[assetRecId][0].table_data.record_id_arr[i])==-1){
																	subAssets[0].table_data.record_id_arr.push(assetWiseSubAsset[assetRecId][0].table_data.record_id_arr[i]);
																}
															}
															
														}
													}
													if(subAssets!=undefined && subAssets.length>0){
														assetWiseSubAsset[assetRecId]=subAssets;
													}
												}
											}
										}
										asset_HC_data.assetId=assetRecId;
										asset_HC_data.data=asset_HC_fields;
										asset_HC_arr.push(asset_HC_data);

									}
								}
								zoneRec.data=WOZone[zone_model[index].zone_data.Name];
								zoneRec.data.Name=zone_model[index].zone_data.Name;
								zoneRec.data.Id=zone_model[index].zone_data.Id;
								zoneRec.asset_HC_arr=asset_HC_arr;
								ZoneDetails.push(zoneRec);
							}
							
							_model.mediumReport.ZoneDetails=ZoneDetails;
							_model.mediumReport.assetWiseSubAsset=assetWiseSubAsset;
							
							
							console.log('test');
							var that = this;
							$('.accordion-title').each(function(){
								that.accordion_section_visibility($(this), 0, true)
							});
							$('#reportPage').css("display", "none");
							$('#shortPDF').css("display", "block");
							$('#mediumPDF').css("display", "block");
								

							$('.element-to-print').each(function(){
								$(this).css("display", "block");
							});

							$('.element-to-hide').each(function(){
								$(this).css("display", "none");
							});

							$('.hide-sub-assets').each(function(){
								$(this).css("display", "none");
							});

							$('.record_details .card').css('border', '0');

							$('.header').each(function(){
								$(this).css("display", "none");
							});
							$('body').each(function(){
								$(this).css("overflow", "unset");
							});
							$('.page_container').each(function(){
								$(this).css("overflow", "unset");
							});
							$('#record_details_card').each(function(){
								$(this).css("margin", "0px");
								$(this).css("padding", "12px");
								$(this).css("border", "0px solid rgb(221, 219, 218);");
							});
							$('.report-button').each(function(){
								$(this).css("display", "none");
							});

							$('.background_image').each(function(){
								$(this).css("display", "none");
							});
							
							document.title = 'Fike Field Service-'+ _model.shortReport.WorkOrderNumber.value +'-'+new Date().toISOString().slice(0,10);
							setTimeout(function(){
								
									window.print()
									document.title = 'Fike Field Service ';
									$('.page_container').each(function(){
										$(this).css("overflow", "auto");
									});
									$('body').each(function(){
										$(this).css("overflow", "hidden");
									});
									$('.element-to-print').each(function(){
										$(this).css("display", "none");
									});
									$('#reportPage').css("display", "block");
									$('#mediumPDF').css("display", "none");
									$('#shortPDF').css("display", "none");
		
									$('.element-to-hide').each(function(){
										$(this).css("display", "");
									});
		
									$('.hide-sub-assets').each(function(){
										$(this).css("display", "");
									});
									$('.header').each(function(){
										$(this).css("display", "");
									});
									$('#record_details_card').each(function(){
										$(this).css("margin", "12px");
										$(this).css("padding", "0px");
										$(this).css("border", "1px solid rgb(221, 219, 218);");
									});
									$('.report-button').each(function(){
										$(this).css("display", "");
									});
									$('.background_image').each(function(){
										$(this).css("display", "");
									});
									$('.record_details .card').css('border', '1px solid rgb(221, 219, 218)');
		
									$( ".pdf-spacer" ).remove();
							},1000);
						},
						

						accordion_section_visibility: (event, duration = 400, justDown = false) => {

							_app.log( "accordion_section_visibility" );

							var content = event.target ? $(event.target) : event;

							if (!justDown && content.is('input, div.ico-remove, div.ico-draw-chart, select'))
								return;

							if (!content.hasClass('accordion-title')){
								content = content.closest('.accordion-title');
							}

							content = content.next();

							if (!justDown) {
								content.velocity(
									content.is(':visible') ? 'slideUp' : 'slideDown',
									{
										duration: duration,
										display: content.is(':visible') ? 'none' : ''
									}
								);
							}else if (justDown && !content.is(':visible')){
								content.velocity(
									'slideDown',
									{
										duration: duration,
										display: ''
									}
								);

							}
						},

						generate_titles_for_engineers_table: (titles,skipTravelDate) => {
							if(skipTravelDate==null){
								skipTravelDate=false;
							}
							let tmp = [ "Start_Work__c", "Break_Time__c","End_Work__c"];
							
							let payload = [];
							let payload2 = [];
							let found = false;
							// console.log('titles');
							// console.log(titles);


							for (var titleId in titles){
								
								if (titleId === 'Id')
									continue;
								/*if (skipTravelDate && titles[titleId].name === 'End_Travel__c')
									continue;
								if (skipTravelDate && titles[titleId].name === 'Start_Travel__c')
								continue;*/

								if( tmp.indexOf(titles[titleId].name) === -1){

									if( titles[titleId].label == "Name" ) {
										titles[titleId].label = "Engineer";
									}
									var formatType={};
									formatType[titles[titleId].type]=true;
									payload.push({
										rowspan: 2,
										colspan: 1,
										title: titles[titleId].label,
										class: formatType
									})
								}else{
									if (skipTravelDate && titles[titleId].name === 'End_Travel__c')
										continue;
									if (skipTravelDate && titles[titleId].name === 'Start_Travel__c')
									continue;
									if (!found) {
										found = true;
										var formatType={};
										formatType[titles[titleId].type+' report-table-center']=true;
										payload.push({
											rowspan: 1,
											colspan: tmp.length,
											title: "Working Time",
											class: formatType
										});
									}

									var formatType={};
									formatType[titles[titleId].type+' alignCenter']=true;

									payload2.push({
										title: titles[titleId].label,
										class: formatType
									});
								}
							}

							return {payload, payload2}
						},

						filtered_field_for_work_order: (allFields) => {
							let nededFields = ["WorkOrderNumber","Customer_WO__c", "WorkTypeId", "Site_Address__c", "AccountId", "Subject", "Description", "Responsible_Service_Engineeer__c", "Priority", "Status", "Safety_Assessment_Performed__c"];
							let fieldForOutput = [];

							for (var fieldKey in allFields){
								if (nededFields.indexOf(allFields[fieldKey].name) !== -1){
									fieldForOutput.push(allFields[fieldKey]);
								}
							}
							return fieldForOutput;
						},

						filtered_field_for_materials: (allFields) => {
							let nededFields = ["Change_Order__c", "QuantityOnHand", "Part_Number__c", "Description__c", "Fike_Stock__c", "Cust_Stock__c","Return_MRA__c", "OwnerId","EngineerName__c"];
							let fieldForOutput = [];

							// console.log(allFields);

							for (var fieldKey in allFields){
								if (nededFields.indexOf(allFields[fieldKey].name) !== -1){
									if (allFields[fieldKey].name === "OwnerId" && allFields[fieldKey].label === "Owner ID")
										continue;

									if (allFields[fieldKey].name === "OwnerId" && allFields[fieldKey].label === "Full Name") {
										allFields[fieldKey].label = "Engineer";
									} else if (allFields[fieldKey].name === "QuantityOnHand" && allFields[fieldKey].label === "Quantity On Hand") {
										allFields[fieldKey].label = "Quantity";
									};

									fieldForOutput.push(allFields[fieldKey]);
								}
							}

							 // console.log(fieldForOutput);
							return fieldForOutput;
						},

						save_report_changes: function () {
							// this.changes_in_report_model.map(change, {
							// 	return Object.values(change);
							// })
							// console.log(this.changes_in_report_model);
						},

						remove_item: function (model, parent_item_id, item) {

							if ( confirm( "Are you sure you want to delete this record?" ) === false ) {

								return;

							};

							if ( typeof model[ item ][ "Id" ] === "number" ) {

								// remove change object from storage

								delete _model.changes_in_report_model[ _model.report_model.record_id ][ model[ item ][ "Id" ] ];
								_model.hasRecordChange=true;
								//this.save_changes_to_storage();

							} else {

								this.push_changed_field(model[item], 'Delete');

							};

							Vue.delete(model, item);

						},

						add_item: function (parent_model, model, model_name, asset = null, zone = null){

							_model.record_details_mode = "edit";

							var new_model = JSON.parse(JSON.stringify(Object.assign(model)));
							var outputObject = {};

							_app.log( "new_model", JSON.parse( JSON.stringify( model, null, "\t" ) ) );

							_app.log( "add_item", parent_model, model, model_name );

							var new_id = Date.now();
							var objectName = model_name;

							for(var field in parent_model){
								if (field[0] === '_'){
									if (field !== ''){
										console.log( "SDIFDSFIDFIJDFJSILSDFJISDFIJFDSIJ" );
										objectName = field;
									}
								}
							}

							for (var field in new_model){

								if (field[0] === '_'){

									console.log( "_", field );
									new_model[ field ] = {};

								}else if (typeof new_model[field] === 'object'){

									new_model[field]['isEditable'] = true;
									new_model[field]['value'] = null;
									new_model[field]['Id'] = new_id;
									new_model[field][ "record_id" ] = new_id;

									if ( model_name === '_Sub_Asset__c' ) {

										outputObject.childId = new_id;

									};

								}else{
									if (field === 'Id') {
										new_model[field] = new_id;
									} else{
										new_model[field] = '';
									}
								}
							};

							var child_object_arr = _priv.prepend_arr( parent_model[ model_name ], new_model );
							this.$set( parent_model, model_name, child_object_arr );

							if ( objectName === "_Sub_Asset__c" ) {

								outputObject.asset_id = asset.Id;
								outputObject.Asset__c = asset.Id;
								
							};

							if ( objectName === "_Asset_c__c" ) {

								outputObject.Zone__c = parent_model.Id;

							};

							if ( objectName === '_Sub_Asset__c' && typeof asset.Id === "number" ){

								console.log( "asset", asset );
								console.log( "parent_model", parent_model );
								console.log( "parent_model_id", parent_model.Id );

								outputObject.Id = asset.Id;
								outputObject.childId = new_id;
								outputObject.Zone__c = zone.Id;

							} else {
								outputObject.Id = new_id;
							}
							outputObject.objectName = objectName;

							console.log( "outputObject", outputObject );
							console.log( "asset", asset );

							this.push_changed_field(outputObject, 'Insert');

						},

						add_asset: function ( parent_model ) {

							_model.record_details_mode = "edit";

							var type_name = '_Asset_c__c';
							var new_model = $.extend( true, {}, _state.default_filed_hash[ type_name ] );

							var outputObject = {};

							var new_id = Date.now();
							var objectName = model_name;

							for ( var field in new_model ) {

								if (field[0] === '_'){

									console.log( "_", field );
									new_model[ field ] = {};

								} else if (typeof new_model[field] === 'object'){

									new_model[field]['isEditable'] = true;
									new_model[field]['value'] = null;
									new_model[field]['Id'] = new_id;
									new_model[field][ "record_id" ] = new_id;

								}else{
									if (field === 'Id') {
										new_model[field] = new_id;
									} else{
										new_model[field] = '';
									}
								}
							};

							var child_object_arr = _priv.prepend_arr( parent_model[ model_name ], new_model );
							this.$set( parent_model, model_name, child_object_arr );

							if ( objectName === "_Asset_c__c" ) {

								outputObject.Zone__c = parent_model.Id;

							};

							outputObject.Id = new_id;
							outputObject.objectName = objectName;

							console.log( "outputObject", outputObject );

							this.push_changed_field( outputObject, 'Insert' );

						},

						push_changed_field: async function (field, type = 'Edit', objectName = null, asset = null) {

							_app.log( "push_changed_field", field, objectName, asset, field.asset_id );

							// if (field.type === 'SEARCH'){
							// 	var textValue = null;
							//
							// 	for (var option in field.options){
							// 		if (field.value === field.options[option].label) {
							//						 field.value = field.options[option].value;
							//				 	return;
							// 		}
							// 	}
							// }

							if (!_model.changes_in_report_model[_model.report_model.record_id]) {

								_model.changes_in_report_model[_model.report_model.record_id] = {};

							};

							if(field.isChange==undefined)
							{
								field.isChange=true;
								this.$forceUpdate();
							}

							var change_object_hash = _model.changes_in_report_model[ _model.report_model.record_id ];
							var change_object = change_object_hash[ field.Id ]
							var id = field.Id;

							if(objectName === '_Sub_Asset__c' && typeof field.asset_id === "number" ) {

							} else {
								if (!change_object){
									change_object_hash[ id ] = {Id: id};
									change_object = change_object_hash[ id ];
								}
								if (change_object.Type !== 'Insert'){
									change_object.Type = type;
								}
							}

							if (type === 'Insert') {

								if(field.objectName === '_Sub_Asset__c' && typeof field.asset_id === "number" ){

									if (typeof change_object.child !== 'object') {

										change_object.child = {};
										
									};

									change_object.child[field.childId] = field;
									change_object.child[field.childId].Type = 'Insert';
									change_object.child[field.childId].objectName =	field.objectName[0] === '_' ? field.objectName.slice(1) : field.objectName;
									change_object.child[field.childId].Zone__c = field.Zone__c;

									// delete change_object.child[field.childId].Id;
									// delete change_object.child[field.childId].childId;

								} else {

									change_object_hash[ field.Id ] = field;
									change_object = change_object_hash[ id ];

									if (field.objectName === 'ProductItem'){

										change_object.workOrderId = field.ProductItem;
										delete change_object['ProductItem'];

									}

									change_object.Type = 'Insert';
									change_object.objectName =	field.objectName[0] === '_' ? field.objectName.slice(1) : field.objectName;
									
									change_object.Service_Work_Order__c = _model.report_model.record_id;
									change_object.Work_Order__c = _model.report_model.record_id;

									delete change_object['Id'];
								}
							}

							if (type === 'Edit'){
								
								
								if ( field.name === "ContactId" ) {

									change_object[field.name] = field.value.value;

								} else  if ( field.name === "Engineer__c" ) {

									if ( field.value && field.value.value ) {

										change_object[field.name] = field.value.value;
										
									} else {

										change_object[field.name] = "";

									};

								} else if (objectName === '_Sub_Asset__c' && asset && typeof asset.Id === "number" ){
									// console.log(field);
									console.log(asset.Id, field.Id);
									// console.log(change_object_hash[asset.Id].child[field.childId]);
									change_object_hash[asset.Id].child[field.Id][field.name] = field.value;

									if (change_object_hash[asset.Id].child[field.Id] !== 'Edit') {
										delete change_object_hash[asset.Id].child[field.Id].Id;
										delete change_object_hash[asset.Id].child[field.Id].childId;
									}

								} else {
									change_object[field.name] = field.value;
								}
								
								

							}

							if ( change_object && change_object[ "OwnerId" ] && change_object[ "OwnerId" ].value ) {

								change_object[ "OwnerId" ] = change_object[ "OwnerId" ].value;

							};

							_app.log( "change_object", change_object );

							// if ( change_object.Type === 'Edit' && typeof field.Id === "number" ) {

							// 	setTimeout( () => {

							// 		alert( "The changes were not saved, cannot edit a synced record" );

							// 	}, 50 );

							// } else {
								_model.hasRecordChange=true;
								this.$forceUpdate();
								//this.save_changes_to_storage();
	
							// };

							// var storage = await _app.x.chrome_p.storage.local.get([ "reports_diffs", "reports" ]);

							// storage.reports_diffs = _model.changes_in_report_model;

							// _model.reports_array[_model.report_model.record_id].status_data.edited_status = 'edited';
							// _model.reports_array[_model.report_model.record_id].status_data.edited = true;

							// _model.report_model.status_data.edited_status = 'edited';
							// _model.report_model.status_data.edited = true;


							// storage.reports[_model.report_model.record_id] = JSON.parse(JSON.stringify(_model.report_model));

							// chrome.storage.local.set( storage );
						},

						add_item_to_materials_and_eng: function( parent_model, model, model_name ){

							_model.record_details_mode = "edit";

							if ( model_name === "Service_Time_Entry__c" ) {

								var fikeEngineers_options = [];

								_model.report_model.fikeEngineers.forEach( ( data ) => {

									fikeEngineers_options.push({
										value: data.Id,
										label: data.Name,
									});

								});

								var new_model = {
									"0": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "Change Order",
										"name": "Change_Order__c",
										"options": null,
										"type": "BOOLEAN",
										"value": null
									},
									"1": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "OverNight",
										"name": "OverNight__c",
										"options": null,
										"type": "BOOLEAN",
										"value": null
									},
									
									"2": {
										"Id": 1563104387,
										"isEditable": true,
										"isRequired": true,
										"label": (parent_model.WORecordType=="Fire_Protection")?"Technician":"Engineer",
										"name": (parent_model.WORecordType=="Fire_Protection")?"EngineerName__c":"Engineer__c",
										"options": (parent_model.WORecordType=="Fire_Protection")?null:fikeEngineers_options,
										"type": (parent_model.WORecordType=="Fire_Protection")?"STRING":"SEARCH",
										"value": null
									},
									"3": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "Date",
										"name": "Date__c",
										"options": null,
										"type": "DATE",
										"value": null
									},
									"4": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "Start Travel",
										"name": "Start_Travel__c",
										"options": null,
										"type": "TIME",
										"value": null
									},
									"5": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "Fixed Travel (Start)",
										"name": "Fixed_Travel_Start__c",
										"options": null,
										"type": "BOOLEAN",
										"value": null
									},
									
									"6": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "Start Work",
										"name": "Start_Work__c",
										"options": null,
										"type": "TIME",
										"value": null
									},
									"7": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "Break Time",
										"name": "Break_Time__c",
										"options": null,
										"type": "DOUBLE",
										"value": null
									},
									"8": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "End Work",
										"name": "End_Work__c",
										"options": null,
										"type": "TIME",
										"value": null
									},
									"9": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "End Travel",
										"name": "End_Travel__c",
										"options": null,
										"type": "TIME",
										"value": null
									},
									"10": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "Fixed Travel (End)",
										"name": "Fixed_Travel_End__c",
										"options": null,
										"type": "BOOLEAN",
										"value": null
									},
									
									"11": {
										"Id": 1563104387,
										"isEditable": true,
										"label": "Mileage (KM/Mi)",
										"name": "Mileage__c",
										"options": null,
										"type": "DOUBLE",
										"value": null
									},
									"Id": "a1W18000001JWmREAW"
								};

							} else if ( model_name === "ProductItem" ) {

								var fikeEngineers_options = [];

								_model.report_model.fikeEngineers.forEach( ( data ) => {

									fikeEngineers_options.push({
										value: data.Id,
										label: data.Name,
									});

								});

								var new_model = {
									"0": {
										"Id": 1563105477,
										"isEditable": true,
										"label": "Change Order",
										"name": "Change_Order__c",
										"options": null,
										"type": "BOOLEAN",
										"value": null
									},
									"1": {
										"Id": 1563105477,
										"isEditable": true,
										"isRequired": true,
										"label": "Quantity",
										"name": "QuantityOnHand",
										"options": null,
										"type": "DOUBLE",
										"value": null
									},
									"2": {
										"Id": 1563105477,
										"isEditable": true,
										"label": "Part Number",
										"name": "Part_Number__c",
										"options": null,
										"type": "STRING",
										"value": null
									},
									"3": {
										"Id": 1563105477,
										"isEditable": true,
										"label": "Description",
										"name": "Description__c",
										"options": null,
										"type": "TEXTAREA",
										"value": null
									},
									"4": {
										"Id": 1563105477,
										"isEditable": true,
										"label": "Owner ID",
										"name": "OwnerId",
										"options": $.extend( true, [], fikeEngineers_options ),
										"type": "SEARCH",
										"value": null
									},
									"5": {
										"Id": 1563105477,
										"isEditable": true,
										"label": "Fike Stock",
										"name": "Fike_Stock__c",
										"options": null,
										"type": "BOOLEAN",
										"value": null
									},
									"6": {
										"Id": 1563105477,
										"isEditable": true,
										"label": "Cust Stock",
										"name": "Cust_Stock__c",
										"options": null,
										"type": "BOOLEAN",
										"value": null
									},
									"7": {
										"Id": 1563105477,
										"isEditable": true,
										"isRequired": true,
										"label": (parent_model.WORecordType=="Fire_Protection")?"Technician":"Engineer",
										"name": (parent_model.WORecordType=="Fire_Protection")?"EngineerName__c":"OwnerId",
										"options": (parent_model.WORecordType=="Fire_Protection")?null: $.extend( true, [], fikeEngineers_options ),
										"type": (parent_model.WORecordType=="Fire_Protection")?"STRING":"SEARCH",
										"value": null
									},
									"8": {
										"Id": 1563105477,
										"isEditable": true,
										"label": "Return/MRA",
										"name": "Return_MRA__c",
										"options": null,
										"type": "BOOLEAN",
										"value": null
									},
									"Id": "0Co18000000028QCAQ"
								};

							};

							_app.log( "new_model", new_model );

							// console.log( "new_model", JSON.stringify( new_model, null, "\t" ) );

							var outputObject = {};
							var id = Date.now();

							outputObject.objectName = model_name;
							outputObject.Id = id;
							// new_model.local = true;

							// console.log(model_name);
							outputObject[model_name] = _model.report_model.record_id;

							for (var fields in new_model){
								new_model[fields].value = null;
								new_model[fields].Id = id;
							}
							new_model.Id = id;

							var newArray = [];

							newArray.push(new_model);

							for (var item in parent_model[model_name]){
								newArray.push(parent_model[model_name][item]);
							}

							this.$set(parent_model, model_name, newArray);

							this.push_changed_field(outputObject, 'Insert');

						},

						show_drop_down_report: function (event) {
							event.target.nextElementSibling.classList.toggle('show');
						},
						
						get_field_by_name: function (fields, name) {
							for (var field_id in fields){
								if (fields[field_id].name === name)
									return fields[field_id];
							}
							return '';
						},
						
						draw_chart: async function (hw_id) {
							var densityCanvas = document.getElementById("densityChart");
							densityCanvas.parentNode.classList.add('visible');
							_model.chartTable={};
							_model.chartView="Chart";
							if (_model.chart != null)
								_model.chart.destroy();

							var storage = await _app.x.chrome_p.storage.local.get([ "HCChartDataArr" ]);

							var current = storage.HCChartDataArr[_model.report_model.record_id][hw_id];

							console.log(current);
							// start change for display table
							var tableData=[];
							if(current!=undefined && current.tableData!=undefined ){
								for (var i = 0; i < current.tableData.length; i++){
									var tdata={};
									if(current.tableData[i].columns!=undefined){
										var emptyColumns=0;
										for (var j = 0; j < current.tableData[i].columns.length; j++){
											tdata[current.tableData[i].columns[j]]=current.tableData[i].data[j];
											if(current.tableData[i].data[j]==undefined 
												|| current.tableData[i].data[j]==null
												|| current.tableData[i].data[j]==""){
													emptyColumns++;
												}
										}
										if(emptyColumns!=current.tableData[i].columns.length){
											tableData.push({
												Name:current.tableData[i].Name,
												Data : tdata,
												lastModifiedDate : current.tableData[i].lastModifiedDate
											})
										}
									}
								}
							}
							console.log(tableData);
							var chartTable={};
							chartTable.columns=current.tableColumns;
							chartTable.data=tableData;
							_model.chartTable=chartTable;
							//end change for display table

							var data = [];

							var colors = ['rgba(0, 99, 132, 0.6)',
								'rgba(30, 99, 132, 0.6)',
								'rgba(60, 99, 132, 0.6)',
								'rgba(90, 99, 132, 0.6)',
								'rgba(120, 99, 132, 0.6)',
								'rgba(150, 99, 132, 0.6)',
								'rgba(180, 99, 132, 0.6)',
								'rgba(210, 99, 132, 0.6)',
								'rgba(240, 99, 132, 0.6)'];

							

							for (var i = 0; i < current.chartData.length; i++){

								// Added to remove empty columns
								var emptyColumns=0;
								for(var j=0;j<current.chartData[i].data.length;j++){
									if(current.chartData[i].data[j]==undefined 
										|| current.chartData[i].data[j]==null
										|| current.chartData[i].data[j]==""){
											emptyColumns++;
										}
								}
								if(emptyColumns!=current.chartData[i].data.length){
									data.push({
										label: current.chartData[i].columnName,
										data: current.chartData[i].data,
										borderWidth: 0,
										backgroundColor: colors[i]
									});
								}
							}

							_model.chart = new Chart(densityCanvas, {
								type: 'bar',
								data: {
									labels: current.chartColumns,
									datasets: data
								}
							});

						},

						close_chart: function () {
							var densityCanvas = document.getElementById("densityChart");

							if ( _model.chart && _model.chart.destroy ) {

								_model.chart.destroy();

							};

							document.querySelector(".chart-wrapper").classList.remove('visible');
						}

					},

				});

				await _app.x.util.wait( 1 );

				_model.page_is_loaded = true;
				_priv.hide_loading_overlay();

			},

		};

		return _pub;

	} () );

	( function ( x ) {

		x.util.load_resources([

			[ "config", "json", "local/config.json" ],

		]).then( ( resources ) => {

			var config = resources[ "config" ];
			var app = {

				name: "popup",

				x: x,
				log: x.log,
				config: config,
				resources: resources,

			};

			x.log.init( app );

			x.conv.set_options({

				mode: resources.config.mode,
				debug: false,
				silence: [],

			});

			main_view.init( app );

		});

	} ( window.webextension_library ) );



