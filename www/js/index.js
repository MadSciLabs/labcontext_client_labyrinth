/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


var app = {
    // Application Constructor
    initialize: function() {
        
        console.log('Initialize');
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {

        console.log('THIS APP IS GOOD');
        
        $(".pushbutton_onoff").on("touchstart", function(evt) {
                                  console.log("push onoff");
                                  console.log(evt.target.id + "_on");
                                  sb.send(evt.target.id + "_on", "boolean", "true");
                                  });

        $(".pushbutton_onoff").on("touchend", function(evt) {
                                  console.log("push onoff");
                                  console.log(evt.target.id + "_off");
                                  sb.send(evt.target.id + "_off", "boolean", "true");
                                  });
        
        //Create SB Instance
        app.createSBInstance();
        
        //bluetoothle.initialize(initializeSuccess, initializeError);
        console.log("After BLE Init");
        
        //throwAlert("Do you wanna play?","Asteroids","go");
        
        initTiltControls();
        console.log("AFter init tilt contorls");

    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
        /*
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        */
        
        console.log('Received Event: ' + id);
    },

    /*
     *	ON SPACEBREW OPEN
     */
    onSpacebrewOpen: function() {
        
        var message = "Now connected as <strong>" + sb.name() + "</strong>. ";
        if (sb.name() === app_name) {
            message += "<br>You can customize this app's name in the query string by adding <strong>name=your_app_name</strong>."
        }
        $("#name").html( message );
    },

    /**
     * onRangeMessage Function that is called whenever new spacebrew range messages are received.
     * 				  It accepts two parameters:
     * @param  {String} name  	Holds name of the subscription feed channel
     * @param  {Integer} value 	Holds value received from the subscription feed
     */
    onRangeMessage: function(name, value){
        console.log("Received new range message ", value);
        $("#"+name).slider('refresh', value);
    },

    /**
     * onBooleanMessage Function that is called whenever new spacebrew boolean messages are received.
     *          It accepts two parameters:
     * @param  {String} name    Holds name of the subscription feed channel
     * @param  {Boolean} value  Holds value received from the subscription feed
     */
    onBooleanMessage: function( name, value ){
        console.log(name + " " + value);
    },

    onButtonPress: function(evt) {
        console.log("[onButtonPress] button has been pressed");
        console.log(evt.target.id);
        sb.send(evt.target.id, "boolean", "true");
    },
    
    killSBInstance: function() {
    
        console.log("Kill an SB instance");
        sb.close();
    },

    /*
     *	MAKE SB CONNECTION ... THIS HAPPENS ON CLIENT SIDE ONCE SB OBJECTS CREATED
     */
    makeSBConnections: function() {
        
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
            
            console.log("*IP : " + ip_client);
            //Make Route
            sb.addRoute(interaction.connection,ip_client,_fields['name'],interaction.server_name,ip_server,_fields['name']);
            console.log("CONNECT " + interaction.connection,ip_client,_fields['name'],interaction.server_name,ip_server,_fields['name']);
        }
    },
    
    createSBInstance: function(_uuid) {
        
        console.log("Create an SB instance");
        
        //Grab the URL variables
        interaction.user = "adamlassy"; //nescape(window.getQueryString("user"));
        interaction.uuid = _uuid; //unescape(window.getQueryString("uuid"));
        interaction.type = "client"; //unescape(window.getQueryString("type"));
        
        
        url_interaction = "http://lab.madsci1.havasworldwide.com/context/" + interaction.uuid;
        model_interaction = "context.interaction";

        //Get Interaction Set
        sb = new Spacebrew.Client();
        sb.extend(Spacebrew.Admin)
        
        //sb.onRangeMessage = onRangeMessage;
        
        sb.onOpen = app.onSpacebrewOpen;
        sb.onBooleanMessage = app.onBooleanMessage;
        

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
                             
                             console.log("Interaction Server : " + interaction.connection);
                             
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

};


/*
 *  BLE STUFF
 */
function initializeSuccess(obj)
{
    console.log("Initialize success");
    
    if (obj.status == "initialized")
    {
        //var address = window.localStorage.getItem(addressKey);
        startScan();
    }
    else
    {
        console.log("Unexpected initialize status: " + obj.status);
    }
}

function startScan()
{
    numScanned = 0;
    
    //console.log("SCAN");
    //console.log("Bluetooth initialized successfully, starting scan for heart rate devices.");
    var paramsObj = {};//"serviceAssignedNumbers":[]};
    bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
}

function initializeError(obj)
{
    console.log("Initialize error: " + obj.error + " - " + obj.message);
}

function startScanSuccess(obj)
{
    if (obj.status == "scanResult")
    {
        numScanned++;
        
        //console.log("Scan Result");
        //console.log(obj);
        
        //Add to beacon array
        if (obj.address in arrBeacons)
        {
            arrBeacons[obj.address].rssi = obj.rssi;
            
            _offset = -1*obj.rssi - 50;
            if (_offset < 0) { _offset = 0;}
            
            _offset = 3*_offset;
            $("#" + obj.address).css({top: _offset});

        }
        else
        {
            url_interaction = "http://lab.madsci1.havasworldwide.com/context/" + obj.address;
            console.log("* Set value : " + url_interaction);
            
            //console.log("URL: " + url_interaction);
            arrBeacons[obj.address] = {address: obj.address, rssi: obj.rssi, name: "", description: ""};
    
            var request = $.ajax({
                dataType: "json",
                url: url_interaction,
                success: function(data) {
                                 
                        connection_data = data;
                                 
                        //Get Interaction info
                        _row = data[0]

                        if (_row) {
                                 
                                 arrBeacons[obj.address].name = _row.fields['name'];
                                 arrBeacons[obj.address].description = _row.fields['description'];
                        }
                        
                        //console.log("* name : " + arrBeacons[obj.address].name;
                        //console.log("* desc : " + arrBeacons[obj.address].description;
                                 
                        //console.log("<div id=\"" + obj.address + "\" class=\"beaconLabel\">" + _row.fields['name'] + "</div>");

                        $("#content_beacon").append("<div id=\"" + obj.address + "\" class=\"beaconLabel\">" + _row.fields['name'] + "</div>");
                        
                        /*
                         * Handle the connect buttons
                         */
                        $("#" + obj.address).on("touchstart", function(evt) {
                                        stopScanForever();
                                        
                                        console.log("**** beacon");
                                        console.log(obj.address);
                                                      
                                        $("#content_beacon").hide();
                                        $("#content_description").show();
                                                
                                        $("#content_description_body").html(arrBeacons[obj.address].name + "<br><br>" + arrBeacons[obj.address].description + "<br><br>");
                                                
                                        $("#cancel").on("touchstart", function(evt) {
                                                $("#content_description").hide();
                                                $("#content_beacon").show();
                                                        
                                                startScan()
                                        });
                                        
                                        $("#connect").on("touchstart", function(evt) {
                                                $("#content_description").hide();
                                                $("#content_play").show();
                                                
                                                //Make the SB Connections
                                                app.makeSBConnections()
                                                                
                                        });
                                                
                                        //Create the SB instance
                                        app.createSBInstance(obj.address);
                                                
                        });
                                 
                                 
                },
                timeout: 8000
            }).fail( function( xhr, status ) {
                console.log("fail");
            })
            
        }

        //If Max scanned imediately return values
        if (numScanned >= 2)
        {
            bluetoothle.stopScan(stopScanSuccess, stopScanError);
            clearScanTimeout();        }
        
        //window.localStorage.setItem(addressKey, obj.address);
        //connectDevice(obj.address);
    }
    else if (obj.status == "scanStarted")
    {
        //console.log("Scan was started successfully, stopping in 3");
        scanTimer = setTimeout(scanTimeout, 5000);
    }
    else
    {
        console.log("Unexpected start scan status: " + obj.status);
    }
}

function stopScanForever()
{
    bluetoothle.stopScan(stopScanSuccessForever, stopScanError);
    clearScanTimeout();
}

function startScanError(obj)
{
    console.log("Start scan error: " + obj.error + " - " + obj.message);
}

function scanTimeout()
{
    //console.log("Scanning time out, stopping");
    bluetoothle.stopScan(stopScanSuccess, stopScanError);
}

function clearScanTimeout()
{
    //console.log("Clearing scanning timeout");
    if (scanTimer != null)
    {
        clearTimeout(scanTimer);
    }
}

function stopScanSuccess(obj)
{
    //console.log("stop scan success");
    
    if (obj.status == "scanStopped")
    {
        startScan();
    }
    else
    {
        console.log("Unexpected stop scan status: " + obj.status);
    }
}

function stopScanSuccessForever(obj)
{
    //console.log("stop scan success");
    
    if (obj.status == "scanStopped")
    {
        console.log("Stop forever");
    }
    else
    {
        console.log("Unexpected stop scan status: " + obj.status);
    }
}

function stopScanError(obj)
{
    console.log("Stop scan error: " + obj.error + " - " + obj.message);
}

/*
 *  ALERT STUFF
 */
function onConfirm(button) {
    console.log('You selected button ' + button);
}

function throwAlert(_msg,_title,_btn)
{
    /**********************
     Alerts
     **********************/
    // Android / BlackBerry WebWorks (OS 5.0 and higher) / iPhone
    //
    


    // Show a custom confirmation dialog
    //
    _btnString = _btn + ",Cancel";

    navigator.notification.confirm(
                                       _msg,  // message
                                       onConfirm,              // callback to invoke with index of button pressed
                                       _title,            // title
                                       _btnString          // buttonLabels
                                       );

}

/**********************
Tilting controls
 **********************/

function initTiltControls() {
    sb.addPublish("testBoolean", "boolean", false);
    sb.addPublish("tilt_x","string","");
    sb.addPublish("tilt_y", "string", "");
    console.log("String publishers added");

    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize",resizeCanvas,false);
    window.addEventListener("touchstart", onTouch, false);
    timerID = setInterval("draw()",(1000/fps));
    timerID = setInterval("sbSender()",150);

    if(window.DeviceMotionEvent) {
        console.log("Accelerometer motion supported");
        window.addEventListener("devicemotion",deviceMove,false);
    }
    else {
        console.log("motion not supported");
    }
    calibrateTilt();
    //alert("initialized");
}

function draw(){
    context.fillStyle = "rgb(0,0,0)";
    if(x > canvas.width) x = canvas.width;
    else if (x < 0) x = 0;
    else x += ax_prime;
    if(y > canvas.height-30) y = canvas.height-30;
    else if (y < 0) y = 0;
    else y += ax_prime;
    //console.log("circle x: " + x + "  circle y: " + y);
    drawCircle(x,y,6,context);
    //z += az;
    context.font = ("10pt Helvetica Neue");
    context.textAlign = "center";
    context.clearRect(0,0,canvas.width,canvas.height);
    context.fillText('X accel: ' + ax_adjusted + " Y accel: " + ay_adjusted, canvas.width/2,canvas.height-20);
    context.wrapText("Labyrinth Game:\n\n" + "Tilt your phone in order to tilt the game board. Try to guide the ball to the glowing column of light.\n\n To zero the tilting controls at any time, simply tap the screen.", canvas.width/2, canvas.height/5, canvas.width-30, 16);
    
    var squareWidth = 2*canvas.width/3;
    var square_posx = (canvas.width -squareWidth)/2;
    var square_posy = canvas.height/2;
    context.beginPath();
    context.lineWidth = "4";
    context.strokeStyle = "gray";
    context.rect(square_posx, square_posy, squareWidth,squareWidth);
    context.stroke();
    
    circle_posx = square_posx+(squareWidth/2);
    circle_posy = square_posy+(squareWidth/2);
    ax_mapped = map_range(ax_adjusted,-10,10,-squareWidth/2,squareWidth/2);
    ay_mapped = map_range(ay_adjusted,-10,10,-squareWidth/2,squareWidth/2);
    
    
    drawCircle(circle_posx+ax_mapped,circle_posy+ay_mapped,10,context);
    context.fillStyle = "red";
    context.fill();
}

function sbSender(){
    var axstring = ax_adjusted.toString();
    var aystring = ay_adjusted.toString();
    //console.log("STRINGS: " + axstring + " " + aystring);
    sb.send("tilt_x","string",axstring);
    sb.send("tilt_y","string",aystring);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function deviceMove(e) {
    
    // prime and adjusted values are so user can calibrate tilt respective to how they hold their phone
    
    ax_prime = (Math.round(e.accelerationIncludingGravity.x*10)/10);
    ax_adjusted = ax_prime - ax_adjust;
    ax_adjusted = (Math.round(ax_adjusted*10)/10);

    ay_prime = (Math.round(e.accelerationIncludingGravity.y*10)/10);
    ay_adjusted = ay_prime - ay_adjust;
    ay_adjusted = (Math.round(ay_adjusted*10)/10);
    
    
    // no need for z-axis acceleration in this implementation, but here it is with gravity accounted for:
    // az = Math.round((e.accelerationIncludingGravity.z - 9.80665)*10)/10;
    
    // reverse x-axis movement for Android phones
    if (androidMode) {
        ax_adjusted = -ax_adjusted;
    }
    // reverse y-axis movement for iOS devices
    if (iOSMode){
        ay_adjusted = -ay_adjusted;
    }
    
    // auto-calibrate upon intialize
    if (needsInitialCalibrate) {
        calibrateTilt();
        needsInitialCalibrate = false;
    }

}

function onTouch(e) {
    e.preventDefault();
    context.clearRect(0,0,canvas.width,canvas.height);
    if (!brewBoolean){
        sb.send("testBoolean","boolean","true");
        brewBoolean = true;
    }
    else {
        sb.send("testBoolean","boolean","false");
        brewBoolean = false;
    }
    
    calibrateTilt();
}

function calibrateTilt() {
    // capture current ax/ay values for calibration
    ax_adjust = ax_prime;
    ay_adjust = ay_prime;
    
}

function drawCircle(x,y,rad,context) {
	context.beginPath();
	context.arc(x,y,rad,getRadians(0),getRadians(360),false);
}

//degree to radian function
function getRadians(dgrs){
	var degrees = (Math.PI/180)*dgrs;
	return degrees;
}
// wrap text function from http://stackoverflow.com/users/504793/jake
CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {
    
    var lines = text.split("\n");
    
    for (var i = 0; i < lines.length; i++) {
        
        var words = lines[i].split(' ');
        var line = '';
        
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = this.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                this.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        
        this.fillText(line, x, y);
        y += lineHeight;
    }
}

// mapping range function from http://stackoverflow.com/users/6782/alnitak
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}


