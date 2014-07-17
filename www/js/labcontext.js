
                function getip(json){
                        ip = json.ip; // alerts the ip address
                }

		/*
		*	SET UP AN INSTANCE OF AN INTERACTION
		*/
		function createSBInstance () {

            console.log("Create an instance");

			//Grab the URL variables
			interaction.user = unescape(window.getQueryString("user"));
			interaction.uuid = unescape(window.getQueryString("uuid"));
			interaction.type = unescape(window.getQueryString("type"));				
			url_interaction = "http://lab.madsci1.havasworldwide.com/context/" + interaction.uuid;
			model_interaction = "context.interaction";

			//$(".pushbutton").on("mousedown", onButtonPress);
			$(".pushbutton").live('vmousedown', function(evt) { 
			//$(".pushbutton").vmousedown(function(evt) {
				//onButtonPress;
                        console.log("[onButtonPress] button has been pressed");
                        console.log(evt.target.id);
                	sb.send(evt.target.id, "boolean", "true");
			});

			//Get Interaction Set
			sb = new Spacebrew.Client();
			sb.extend(Spacebrew.Admin)

			//sb.onRangeMessage = onRangeMessage;
			sb.onOpen = onSpacebrewOpen;
			sb.onBooleanMessage = onBooleanMessage;

			var request = $.ajax({
                        dataType: "json",
                        url: url_interaction,
                        success: function(data) {

				connection_data = data;

				//Get Interaction info
				_row = data[0]
				if (_row) {
					interaction.num_users = _row.fields['num_users'];
					interaction.client_name = _row.fields['client_name'];
					interaction.server_name = _row.fields['server_name'];
					interaction.name = _row.fields['name'];
					interaction.description = _row.fields['description'];

					if (interaction.type == "client") {
						var random_id = "0000" + Math.floor(Math.random() * 10000);
						var random_id = random_id.substring(random_id.length-4);

						interaction.connection = _row.fields['client_name'] + "_" + interaction.user + random_id;
					} else {
						interaction.connection = _row.fields['server_name'];
					}

					console.log("Interaction Sever : " + interaction.connection);
	
					sb.name(interaction.connection);
					sb.description(interaction.description);
				}

				//For each Spacebrew connection
				for (i=1; i<data.length; i++) {

                                	console.log(data[i].fields);
                                	_fields = data[i].fields;
			
					console.log("pub " + _fields['clientPublish']);

					interaction.client_publish = _row.fields[''];
					if (interaction.type == "client" && _fields['clientPublish']) {
						sb.addPublish(_fields['name'], _fields['dataType']);
					} else {
						sb.addSubscribe(_fields['name'], _fields['dataType']);
					}
				}

				console.log("* Setting up spacebrew connection");
				sb.connect();

                        },
                        timeout: 8000

               		}).fail( function( xhr, status ) {
				console.log("fail");
                	})
		}

		/*
		*	MAKE SB CONNECTION ... THIS HAPPENS ON CLIENT SIDE ONCE SB OBJECTS CREATED
		*/
		function makeSBConnections() {

			// triggered when new client connects to server.
			sb.onNewClient = function( client ) { console.log("New client"); };

			// triggered when existing client is reconfigured.
			sb.onUpdateClient = function( client ) { console.log("Update client"); };

			// triggered when an existing client disconnects from server.
			sb.onRemoveClient = function ( name, address) {};

			// triggered when a route is added or removed.
			sb.onUpdateRoute = function ( action, pub, sub ) { console.log("Update route"); };

			console.log("* Making connection");

			//For each Spacebrew connection
			for (i=1; i<connection_data.length; i++) {

                               	_fields = connection_data[i].fields;
			
				//Make Route
				sb.addRoute(interaction.connection,ip,_fields['name'],interaction.server_name,ip,_fields['name']);	
				console.log(">" + interaction.connection+","+ip+","+_fields['name']+","+interaction.server_name+","+ip+","+_fields['name']);	
			}
		}


		/*
		*	ON SPACEBREW OPEN
		*/
/*
		function onSpacebrewOpen() {

			var message = "Now connected as <strong>" + sb.name() + "</strong>. ";
			if (sb.name() === app_name) {
				message += "<br>You can customize this app's name in the query string by adding <strong>name=your_app_name</strong>."
			}
			$("#name").html( message );
		}
*/

