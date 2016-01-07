var map, url;

      require([
	        "esri/map",
      "esri/layers/FeatureLayer",
      
      "esri/dijit/Search",
      "esri/InfoTemplate",
      
      "esri/symbols/SimpleLineSymbol",
      "esri/symbols/SimpleFillSymbol",
      "esri/symbols/TextSymbol",
      "esri/renderers/SimpleRenderer",

      "esri/layers/LabelLayer",

      "esri/Color",
      
      "esri/graphic", 
      "esri/lang",
      
      "dojo/number", 
      "dojo/dom-style", 
      "dijit/TooltipDialog", 
      "dijit/popup", 
	  "dijit/layout/ContentPane", 
	  "dojo/number",
	  "dijit/form/ToggleButton",
	  "dojo/fx/Toggler", "dojo/fx", "dojo/dom", "dojo/on",
	  
	  "esri/geometry/Extent",
	  "esri/SpatialReference",
	  
      "dojo/cookie", "dojo/json", "dojo/domReady!"
		], function(Map, FeatureLayer, Search, InfoTemplate,
        SimpleLineSymbol, SimpleFillSymbol, TextSymbol, SimpleRenderer,
        LabelLayer, Color, Graphic, esriLang, number, domStyle, 
        TooltipDialog, dijitPopup, ContentPane, localeNumber,ToggleButton,
		Toggler, coreFx, dom, on, Extent, SpatialReference, cookie, json) {
        map = new Map("map", {
          basemap: "gray",  //For full list of pre-defined basemaps, navigate to //arcg.is/1JVo6Wd
          center: [-74.005941, 40.712784] //, // longitude, latitude
        });
		
		
       
        map.on("load", function() {
            map.disablePan();
            map.disableMapNavigation();
            map.hidePanArrows();
            map.hideZoomSlider();
			map.graphics.enableMouseEvents();
			map.graphics.on("mouse-out", function(){ 
				map.graphics.clear();
				map.setMapCursor("default");
				url = '';
				boroName = '';
			});
			//graphics on click, open page
			map.graphics.on("click", graphicsClickHandler);
          });
		  
		var myExtent = new esri.geometry.Extent(-74.305941, 40.495004, -73.705941, 40.965382,
			new esri.SpatialReference({wkid:4326}) );		  
		map.setExtent(myExtent);
          
		var layer = new FeatureLayer("//services3.arcgis.com/aD88pT4hjL80xq0F/arcgis/rest/services/simplenybb/FeatureServer/0", {
            outFields: ["BoroName", "Link" ],
            minScale:0,
            maxScale:0
         });
		  
		map.addLayer(layer);
		
		
		var layer_ann = new FeatureLayer("//services3.arcgis.com/aD88pT4hjL80xq0F/arcgis/rest/services/nybb_ano/FeatureServer/0", {
            outFields: ["*"],
            minScale:0,
            maxScale:0
         });
		 var symbol = new SimpleFillSymbol().setColor(new Color([25,25,25,1]));
		 symbol.setOutline(new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([0,0,0,0]), 2));
		 var rendererN = new SimpleRenderer(symbol);
 		 layer_ann.setRenderer(rendererN);  
		map.addLayer(layer_ann);
		
		///HOVER FUNCTION
		var highlightSymbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID, 
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID, 
            new Color([50,50,50]), 1
          ), 
          new Color([125,125,125,0.35])
        );
        //listen for when the onMouseOver event fires on the layer
        layer.on("mouse-over", function(evt){
			map.graphics.clear();
			map.setMapCursor("pointer"); //Add mouse change at hover
			var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);
			url = evt.graphic.attributes.Link
			boroName = evt.graphic.attributes.BoroName
            map.graphics.add(highlightGraphic);
        });
		
		//Add Cookie for boro clicked
		function writeBoroCookie(curBoro){
			c_boro=curBoro;
			if (!curBoro){
				c_boro="";
			}
			if (navigator.cookieEnabled){
				mapBoro = {boro: c_boro};
				cookie("mapBoro",json.stringify(mapBoro));
				curTime = Date.now();
				cookie("mapPID", json.stringify(curTime));
			}
			return mapBoro;
		}

		//open url, for map on click
		function graphicsClickHandler(e){
			if (url == ''){
				return false;
			};
			var newURL="";
			if (pmapOn){
				var MapSelected = document.getElementById("SelectMap").value;
				if (MapSelected=="tc1"){
					if (boroName == "Manhattan"){
						newURL = "http://www1.nyc.gov/assets/finance/jump/property-maps/mh_fy16final.html";
					}
					else if (boroName == "Bronx"){
						newURL = "http://www1.nyc.gov/assets/finance/jump/property-maps/bx_fy16final.html";
					}
					else if (boroName == "Brooklyn"){
						newURL = "http://www1.nyc.gov/assets/finance/jump/property-maps/bk_fy16final.html";
					}
					else if (boroName == "Queens"){
						newURL = "http://www1.nyc.gov/assets/finance/jump/property-maps/qn_fy16final.html";
					}
					else if (boroName == "Staten Island"){
						newURL = "http://www1.nyc.gov/assets/finance/jump/property-maps/si_fy16final.html";
					}
					else {
						newURL = url;
					}			
				dom.byId('divnyctitle').innerHTML = "| Search Map for Tax Class 1 Single to Three Family Homes";					
				}
				else if (MapSelected=="tc2"){
					if (boroName == "Manhattan"){
						newURL = "/DojoPanel_1.html";
					}
					else if (boroName == "Bronx"){
						newURL = "http://www1.nyc.gov/assets/finance/jump/property-maps/bx_fy16final.html";
					}
					else if (boroName == "Brooklyn"){
						newURL = "/TC2Map0105_BK.html";
					}
					else if (boroName == "Queens"){
						newURL = "/TC2Map0105_QN.html";
					}
					else if (boroName == "Staten Island"){
						newURL = "http://www1.nyc.gov/assets/finance/jump/property-maps/si_fy16final.html";
					}
					else {
						newURL = url;
					}	
				dom.byId('divnyctitle').innerHTML = "| Search Map for Tax Class 2 Properties";
				}

			}
			else {
				if (url.indexOf("mh")>=0){
					curBoro = "1";
				}
				else if (url.indexOf("bx")>=0){
					curBoro = "2";
				}
				else if (url.indexOf("bk")>=0){
					curBoro = "3";
				}
				else if (url.indexOf("qn")>=0){
					curBoro = "4";
				}
				else if (url.indexOf("si")>=0){
					curBoro = "5";
				}
				else {
					curBoro ="1";
				}
				writeBoroCookie(curBoro);
				newURL = "compmap"; //Change for the uploaded url for comptool;
			}
			window.open(newURL,'_blank');			
		}
		var pmapOn = true;
		var rpts = false;
		var tabloc = 0;
		on(dojo.byId("divtagp1"),"click",function(e){
			dom.byId('ReportPage').style.display = "none";
			dom.byId('ReportPage').style.visibility = "hidden";
			
			dom.byId('ResearchPage').style.display = "none";
			dom.byId('ResearchPage').style.visibility = "hidden";
			dom.byId('map').style.display = "block";
			if(tabloc!=1){
				map.setExtent(myExtent);
				domStyle.set("divtagp1",{"background-color": "#0052A3","color":"white"});
				domStyle.set("divtagp3",{"background-color": "white","color":"#0052A3"});
				domStyle.set("divtagp2",{"background-color": "white","color":"#0052A3"});
				domStyle.set("divtagp4",{"background-color": "white","color":"#0052A3"});
				pmapOn = true;
				rpts = false;
				tabloc = 1;
				dom.byId('divnyctitle').innerHTML = "| Search Map for Tax Class 1 Single to Three Family Homes";
				dom.byId('instruction').innerHTML = "Please <mark>select a tax class</mark> and click on the borough to search:";
				
				dom.byId('SelectMap').style.display = "block";
			}
		});
		on(dojo.byId("divtagp2"),"click",function(e){
			if(tabloc!=2){
				dom.byId('map').style.display = "none";
				dom.byId('ReportPage').style.display = "block";		
				dom.byId('ReportPage').style.visibility = "visible";	

				dom.byId('ResearchPage').style.display = "none";
				dom.byId('ResearchPage').style.visibility = "hidden";				
				domStyle.set("divtagp2",{"background-color": "#0052A3","color":"white"});
				domStyle.set("divtagp1",{"background-color": "white","color":"#0052A3"});
				domStyle.set("divtagp3",{"background-color": "white","color":"#0052A3"});
				domStyle.set("divtagp4",{"background-color": "white","color":"#0052A3"});
				rpts=true;
				pmapOn = false;
				tabloc = 2;
				dom.byId('divnyctitle').innerHTML = "| Trend Reports on NYC Properties for FY16/17 Tentative Roll";
				
				}
		});
		on(dojo.byId("divtagp3"),"click",function(e){
		    var workable = isWorkable();
			map.setExtent(myExtent);
			dom.byId('ReportPage').style.display = "none";
			dom.byId('ReportPage').style.visibility = "hidden";
			
			dom.byId('ResearchPage').style.display = "none";
			dom.byId('ResearchPage').style.visibility = "hidden";
			dom.byId('map').style.display = "block";
			if((tabloc!=3)&& workable){
				domStyle.set("divtagp3",{"background-color": "#0052A3","color":"white"});
				domStyle.set("divtagp1",{"background-color": "white","color":"#0052A3"});
				domStyle.set("divtagp2",{"background-color": "white","color":"#0052A3"});
				domStyle.set("divtagp4",{"background-color": "white","color":"#0052A3"});
				pmapOn = false;
				rpts = false;
				tabloc = 3;
				dom.byId('divnyctitle').innerHTML = "| Comparable Sales Tool for Tax Class 1 Single to Three Family Homes";
				dom.byId('instruction').innerHTML = "Please click on a borough to find comparable sales:";
				
				dom.byId('SelectMap').style.display = "none";
				dom.byId('alerttext').style.display = "none";
				
			}
		});
		on(dojo.byId("divtagp4"),"click",function(e){
			if(tabloc!=4){
				dom.byId('map').style.display = "none";
				dom.byId('ResearchPage').style.display = "block";		
				dom.byId('ResearchPage').style.visibility = "visible";

			dom.byId('ReportPage').style.display = "none";
			dom.byId('ReportPage').style.visibility = "hidden";
							
				domStyle.set("divtagp4",{"background-color": "#0052A3","color":"white"});
				domStyle.set("divtagp1",{"background-color": "white","color":"#0052A3"});
				domStyle.set("divtagp2",{"background-color": "white","color":"#0052A3"});
				domStyle.set("divtagp3",{"background-color": "white","color":"#0052A3"});
				rpts=true;
				pmapOn = false;
				tabloc = 4;
				dom.byId('divnyctitle').innerHTML = "| Relavant Research and Publications";
				
				}
		});
		on(dojo.byId("SelectMap"),"change",function(e){

		    var MapSelected = document.getElementById("SelectMap").value;
			if (MapSelected=="tc1"){
				dom.byId('divnyctitle').innerHTML = "| Search Map for Tax Class 1 Single to Three Family "
				dom.byId('alerttext').innerHTML = "You have selected <mark>Tax Class 1 Maps</mark>. \nGo ahead and click on the borough to start navigate."
				dom.byId('alerttext').style.display = "block";
			}else if (MapSelected=="tc2"){
				dom.byId('divnyctitle').innerHTML = "| Search Map for Tax Class 2 properties"
				dom.byId('alerttext').innerHTML = "You have selected <mark>Tax Class 2 Maps</mark>. \nGo ahead and click on the borough to start navigate."
				dom.byId('alerttext').style.display = "block";
			}
		});
		
		on(dojo.byId("linkReport1img"),"click",function(e){
			window.open("/LinkPage_work/docs/report1.pdf");
		});
      });
