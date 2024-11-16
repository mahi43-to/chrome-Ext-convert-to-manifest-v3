
function sf_api_manager() {

	var _app = null;

	var _state = {

	};

	var _priv = {

		exec: async (method, path, data, new_api = false) => {

			var storage = await _app.x.chrome_p.storage.local.get(["tokens"]);
			var tokens = storage.tokens;

			if (method === "GET") {
				var response = await _app.x.ajax2({

					method: "GET",
					response_type: "json",
					url: !new_api ? storage.tokens.instance_url + "/services/data/v46.0/ui-api" + path : storage.tokens.instance_url + '/services/apexrest' + path,
					headers: {

						'Authorization': 'Bearer ' + tokens.access_token,

					}

				});

			} else if (method === "PATCH" || method === "POST") {
				var response = await _app.x.ajax2({

					method: method,
					response_type: "json",
					url: !new_api ? storage.tokens.instance_url + "/services/data/v46.0/ui-api" + path : storage.tokens.instance_url + '/services/apexrest' + path,
					// url: !new_api ? "https://fike--partial.my.salesforce.com/services/data/v46.0/ui-api" + path : 'https://fike--partial.lightning.force.com/services/apexrest' + path,
					headers: {

						'Authorization': 'Bearer ' + tokens.access_token,

					},
					rq_body_type: "json",
					rq_body: data

				});

			} else if (method === "NEW_POST") {
				var response = await _app.x.ajax2({

					method: "POST",
					response_type: "json",
					url: path,
					headers: {

						'Authorization': 'Bearer ' + tokens.access_token,

					},
					rq_body_type: "json",
					rq_body: data

				});

			};

			if (response.meta.status === 401) {


				_app.hub.fire("api_error", { response });

			};

			return response;

		},
		
		notify: async ( notification_name, data ) => {

			 if ( notification_name === "chart_api_error" ) {

				_priv.exec_notify( true, notification_name + Date.now(), 'Trend data or portion of Trend data not sync properly , Please sync the record again' ,  "" );

			} 
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

		url_to_data: (url) => {

			var data = {};
			var split = null;

			url.split("#")[1].split("&").forEach((name_value) => {

				split = name_value.split("=");
				data[split[0]] = decodeURIComponent(split[1]);

			});

			return data;

		},

	};

	var _pub = {

		init: async (app) => {

			_app = app;

		},

		upload_file: async (data) => {

			var response = await _priv.exec("POST", "/records", {

				"apiName": "ContentVersion",
				"fields": {
					"Title": data.file_data.name,
					"PathOnClient": data.file_data.name,
					"Description": data.file_data.name,
					"FirstPublishLocationId": data.record_id,
					"VersionData": data.file_data.base_64
				},

			});

			return response;

		},

		get_record_ui_response: async (record_id) => {

			return _priv.exec("GET", "/record-ui/" + record_id + "?childRelationships=WorkOrder.Hardware_Checklists__r,WorkOrder.Attachments&pageSize=999999");

		},
		get_recordTypeId_response: async (objectApiName) => {
			var storage = await _app.x.chrome_p.storage.local.get(["tokens"]);
			var tokens = storage.tokens;

			var response = await _app.x.ajax2({

				method: "GET",
				response_type: "json",
				url: storage.tokens.instance_url + '/services/data/v46.0/query/?q=' + 'SELECT Id FROM RecordType where SobjectType =\''+objectApiName+'\'',
				headers: {

					'Authorization': 'Bearer ' + tokens.access_token,

				}
			});
			return response;
		},
		get_recordType_response: async (objectApiName,recordTypeId) => {
			return _priv.exec("GET", "/object-info/"+objectApiName+"/picklist-values/" + recordTypeId );
		},


		get_report_response: async (record_id) => {
			var storage = await _app.x.chrome_p.storage.local.get(["tokens"]);
			var tokens = storage.tokens;

			var response = await _app.x.ajax2({

				method: "GET",
				response_type: "json",
				url: storage.tokens.instance_url + '/services/apexrest/WorkOrdersNew/' + record_id,
				headers: {

					'Authorization': 'Bearer ' + tokens.access_token,

				}
			});


			if (response.meta.status === 401) {


				_app.hub.fire("api_error", { response });

			};

			return response;
		},
		isSandbox: async () => {
			var storage = await _app.x.chrome_p.storage.local.get(["tokens"]);
			var tokens = storage.tokens;

			var response = await _app.x.ajax2({

				method: "GET",
				response_type: "json",
				url: storage.tokens.instance_url + '/services/data/v46.0/query/?q=SELECT+IsSandbox+From+Organization',
				headers: {

					'Authorization': 'Bearer ' + tokens.access_token,

				}
			});
			if(response!=undefined && response.data!=undefined && response.data.records!=undefined && response.data.records.length>0)
			{
				var storage = await _app.x.chrome_p.storage.local.get(["salesforce_org_type"]);
				storage.salesforce_org_type= response.data.records[0].IsSandbox?'Sandbox':'Production';
				chrome.storage.local.set(storage);
				chrome.runtime.sendMessage({ name: "salesforce_org_detail_updated", data: { salesforce_org_type: response.data.records[0].IsSandbox?'Sandbox':'Production'} });

				
			}
			
		},


		get_chart_response: async (setAssetIds) => {
			var storage = await _app.x.chrome_p.storage.local.get(["tokens"]);
			var tokens = storage.tokens;

			var assetsChart = [];
			var record_for_chart = [];
			var listOfPomises = [];
			for (var i = 0; i < setAssetIds.length; i++) {
				assetsChart.push(setAssetIds[i]);
				if ((i != 0 && i % 100 == 0) || i==setAssetIds.length-1) {
					var response = _app.x.ajax2({

						method: "POST",
						response_type: "json",
						url: storage.tokens.instance_url + '/services/apexrest/WorkOrdersNew/Chart',
						headers: {

							'Authorization': 'Bearer ' + tokens.access_token,

						},
						rq_body_type: "json",
						rq_body: assetsChart
					});

					listOfPomises.push(response);

					assetsChart = [];
				}
				
			}

			var allPromis = await Promise.all(listOfPomises);
			var chartData = [];
			var error=false;
			for (var i = 0; i < allPromis.length; i++) {
				if(allPromis[i].meta!=undefined && allPromis[i].meta.status==200 && allPromis[i].meta.success==true ){
						chartData=chartData.concat(JSON.parse(allPromis[i].data));
				}else{
					error=true;
					
				}
			}
			if(error==true){
				_priv.notify( "chart_api_error" );
			}
			console.log('chartData :: ', chartData);
			return chartData;
		},

		get_picklist_values: async (api_name, record_type_id) => {

			return _priv.exec("GET", `/object-info/${api_name}/picklist-values/${record_type_id}`);

		},

		get_batch_records: async (record_id_arr) => {

			return _priv.exec("GET", `/records/batch/${record_id_arr.join(",")}?layoutTypes=Full&modes=Edit`);

		},

		get_batch_records_2: async (record_id_arr) => {

			return _priv.exec("GET", `/record-ui/${record_id_arr.join(",")}`);

		},

		update_record: async (record_id, record_info) => {

			var storage = await _app.x.chrome_p.storage.local.get(["tokens"]);
			var tokens = storage.tokens;

			var fields_to_update_hash = {};

			record_info.updated_field_name_arr.forEach((field_name) => {

				fields_to_update_hash[field_name] = record_info.record_data.records[record_id].fields[field_name].value;

			});

			_app.log("fields_to_update_hash", fields_to_update_hash);

			var response = await _priv.exec("PATCH", "/records/" + record_id, {
				fields: fields_to_update_hash,
			});

			_app.log("update_record_response", response);

			return response;

		},

		update_report: async (report_id, report_diffs) => {
			var storage = await _app.x.chrome_p.storage.local.get(["tokens"]);

			var response = await _priv.exec("NEW_POST", storage.tokens.instance_url + "/services/apexrest/WorkOrders/Update/", report_diffs, true);

			return response;

			var storage = await _app.x.chrome_p.storage.local.get(["tokens"]);
			var tokens = storage.tokens;

			console.log(JSON.stringify(report_diffs, null, "\t"));

			var xhr = new XMLHttpRequest();
			xhr.open('POST', storage.tokens.instance_url + '/services/apexrest/WorkOrders/Update/', true);
			xhr.setRequestHeader("Content-type", "application/json");
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Authorization", "Bearer " + tokens.access_token);

			xhr.onload = (r) => { console.log("resp> ", r) };
			xhr.onerror = (r) => { console.log("resp> ", r) };
			xhr.ontimeout = (r) => { console.log("resp> ", r) };

			xhr.send(JSON.stringify(report_diffs));

			return xhr;

			// return response;
		},

		launch_web_auth_flow: () => {

			var client_id = _app.config.app_client_id[_app.config.mode];
			var redirect_uri = chrome.identity.getRedirectURL("/salesforce");
			var url = `https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=id+api+web+full`;

			console.log("url", url);

			chrome.identity.launchWebAuthFlow({

				'url': url,
				'interactive': true

			}, async function (redirect_url) {

				var data = _priv.url_to_data(redirect_url);
				console.log(url, data);

				if (data.access_token) {

					var storage = await _app.x.chrome_p.storage.local.get(["tokens"]);
					storage.tokens.instance_url = data.instance_url;
					storage.tokens.access_token = data.access_token;

					chrome.storage.local.set(storage);
					_app.sf_api_manager.isSandbox();
					_app.hub.fire("user_logged_in");

				};

			});

		},

	};

	return _pub;

};