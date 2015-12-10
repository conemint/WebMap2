var map;
	  var curBBL; //add for search on click

	  var guidearray = {"RU33":{"vactr":"2.50%","etr":"5.785%"},"RU32":{"vactr":"4.25%","etr":"5.785%"},"RU31":{"vactr":"6.50%","etr":"5.785%"},"RR33":{"vactr":"4.00%","etr":"5.785%"},"RR32":{"vactr":"4.00%","etr":"5.785%"},"RR31":{"vactr":"6.50%","etr":"5.785%"},"CU33":{"vactr":"2.50%","etr":"5.785%"},"CU32":{"vactr":"4.25%","etr":"5.785%"},"CU31":{"vactr":"6.50%","etr":"5.785%"}};
      require([
      "esri/map",
      "esri/dijit/BasemapToggle",
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
	  "dojo/query",
	  "dijit/form/ToggleButton",
	  "dijit/form/Button",
      "dojo/parser", "dijit/registry",
	  "dojo/fx/Toggler", "dojo/fx", "dojo/dom", "dojo/dom-geometry", "dojo/on","dijit/form/TextBox", 
      "dojo/domReady!"
      ], function (Map, BasemapToggle, FeatureLayer, Search, InfoTemplate,
        SimpleLineSymbol, SimpleFillSymbol, TextSymbol, SimpleRenderer,
        LabelLayer, Color, Graphic, esriLang, number, domStyle,
        TooltipDialog, dijitPopup, ContentPane, localeNumber, query, ToggleButton,Button,
        parser, registry,
		Toggler, coreFx, dom, domGeom, on
			//add query
      ) {


		//WipeIn/Out show and hide buttons;
		var togglerChars = new Toggler({
			node: "Chars",
			showFunc: coreFx.wipeIn,
			hideFunc: coreFx.wipeOut
		});
		 var showButton = new Toggler({
			node: "showButton",
			showFunc: coreFx.wipeIn,
			hideFunc: coreFx.wipeOut
		});
		  togglerChars.hide();
		  showButton.show();
		on(dom.byId("hideButton"), "click", function(e){
			togglerChars.hide();
			showButton.show();
		});
		on(dom.byId("showButton"), "click", function(e){
			togglerChars.show();
			showButton.hide();
		});


		//Load map

         map = new Map("map", {
            basemap: "streets",//"satellite",
            center: [-74.005941, 40.712784], // lon, lat
            zoom: 17
         });

         //ArcGIS Online feature service showing Mahattan Tc1 lots
         var layer = new FeatureLayer("//services3.arcgis.com/aD88pT4hjL80xq0F/arcgis/rest/services/TC2_MH_noncd122015/FeatureServer/0", {
            outFields: ["*"]
         });
         layer.maxScale=1000;
		 layer.minScale=5000;
         var symbol1 = new SimpleFillSymbol().setColor(new Color([0,108,108,0.15]));
		 symbol1.setOutline(new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([0,100,156]), 1));
		 var renderer = new SimpleRenderer(symbol1);
 		 layer.setRenderer(renderer);



         var layer_n = new FeatureLayer("//services3.arcgis.com/aD88pT4hjL80xq0F/arcgis/rest/services/neigh/FeatureServer/0", {
            outFields: ["*"],
			minScale: 300000,
			maxScale: 5000
         });
         var symbol = new SimpleFillSymbol().setColor(new Color([240,150,0,0.0]));
		 symbol.setOutline(new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([166,58,0,0.6]), 2));
		 var rendererN = new SimpleRenderer(symbol);
 		 layer_n.setRenderer(rendererN);


        map.addLayer(layer_n);
        map.addLayer(layer);

        var labelField = "nbhdcaps";

        // create a renderer for the states layer to override default symbology
        var labelColor = new Color([150,150,150,0.9]);

        // create a text symbol to define the style of labels
        var nbhdLabel = new TextSymbol().setColor(labelColor);

        nbhdLabel.font.setSize("14pt");
        nbhdLabel.font.setFamily("Tahoma");

        var nbhdLabelRenderer = new SimpleRenderer(nbhdLabel);
        var labels = new LabelLayer({ id: "labels" });
        // tell the label layer to label the Neighbor feature layer
        labels.addFeatureLayer(layer_n, nbhdLabelRenderer, "{" + labelField + "}");

        // add the label layer to the map
        map.addLayer(labels);

		//Info Window: set size
        map.infoWindow.resize(245,300);

		//Hover popup window set up
        dialog = new TooltipDialog({
          id: "tooltipDialog",

          style: "position: absolute; width: 200px; font: normal normal normal 10pt Tahoma;z-index:100"
        });
        dialog.startup();

        dojo.style(dialog.domNode, "opacity", 0.75);

        var highlightSymbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([0,50,255]), 3
          ),
          new Color([125,125,125,0.35])
        );

		//SET UP BASEMAP TOGGLE
		var toggle = new BasemapToggle({
			map: map,
			basemap: "satellite"
		}, "BasemapToggle");
		toggle.startup();



		///SEARCH FUNCTION
        //Create search widget
        var search = new Search({
          map: map,
          //passing in empty source array to clear defaults such as
          //"All" and the ArcGIS Online World Geocoding service
          sources: [],
          zoomScale: 50000000
        }, "search");

        //listen for the load event and set the source properties
        search.on("load", function () {

          var sources = search.sources;
          sources.push({
             featureLayer: layer,
             placeholder: "Block/Lot",//fix boro
			 prefix: "1/", //fix boro
             searchFields: ["bbl_sp"],
             displayField: "bbl_sp",
             exactMatch: true,
             enableSuggestions: false,
             outFields: ["*"],
             zoomScale: 10000,
             name: "Search by Block/lot",

              //Create an InfoTemplate and include three fields
              infoTemplate: new InfoTemplate("Parcel: ${BORO}/${BLOCK}/${LOT}",
					"</br>DOF Value 2016 Tentative: $</b>${fmv:NumberFormat}</br>"
					+"</br>Total Units:${resunit}</br>"
					+"</br>Gross SQFT:${ttlsqft} SQFT</br>"
					+"</br>Stories:${story:NumberFormat}</br>"
					+"</br>Year Built:${AYB}</br>"
					+"</br>Residential SQFT:${ressqft} SQFT</br></br>"
					+"<div> <a href='http://www1.nyc.gov/site/finance/taxes/property.page'  target='_blank'>View Property Tax Bills</a></div>"
					+"<div> <a href='http://www1.nyc.gov/site/finance/benefits/property-related-benefits.page'  target='_blank'>Exemptions and Abatements</a></div>"
					+"<div> <a href='http://www1.nyc.gov/site/finance/taxes/property-forms/property-forms-assessments-and-valuations.page' target='_blank'>Request Data Correction</a></div>"
					)
          });
          //Set the sources above to the search widget
          search.set("sources", sources);

          map.graphics.enableMouseEvents();
          map.graphics.on("mouse-out", closeDialog);
		  map.graphics.on("click", MapClickSearchHanlder);

         });
        var vactr_dis;
		 search.on("search-results", function (e) {
			var rs, h;
			rs = e.results;

			h = "";

			if (rs == null){
				h = "<div> rs is null</div>";
				return;
			};

			//h = inspect(rs[0][0].feature.attributes, 5, 0);
			var attrs = rs[0][0].feature.attributes;
			if (attrs.bcat=="RR33"){
                vactr_dis=guidearray.RR33;
            }else if(attrs.bcat=="RR32"){
                vactr_dis=guidearray.RR32.vactr;
            }else if(attrs.bcat=="RR31"){
                vactr_dis=guidearray.RR31.vactr;
            }else if(attrs.bcat=="RU33"){
                vactr_dis=guidearray.RU33.vactr;
            }else if(attrs.bcat=="RU32"){
                vactr_dis=guidearray.RU32.vactr;
            }else if(attrs.bcat=="RU31"){
                vactr_dis=guidearray.RU31.vactr;
            }else if(attrs.bcat=="CU33"){
                vactr_dis=guidearray.CU33.vactr;
            }else if(attrs.bcat=="CU32"){
                vactr_dis=guidearray.CU32.vactr;
            }else if(attrs.bcat=="CU31"){
                vactr_dis=guidearray.CU31.vactr;
            }else(vactr_dis="NA");
			setInfoBox(attrs); //replace the set attrs part with a function, define it;
			togglerChars.show();
			showButton.hide();
		});

         search.startup();

		function setInfoBox(attrs){
			setNullValue("bbl", attrs.bbl_sp, "--");
			setNullValue("fmv", "$"+localeNumber.format(attrs.fmv), "--");
			setNullValue("agisqft", "$"+localeNumber.format(attrs.Agi_Pgsf), "--");
			setNullValue("expsqft", "$"+localeNumber.format(attrs.Exp_Pgsf), "--");
			setNullValue("noisqft", "$"+localeNumber.format(attrs.Noi_Pgsf), "--");
			setNullValue("cap", attrs.capr+"%", "--");
			setNullValue("unit", attrs.ttlunit, "--");
			
			setNullValue("story",localeNumber.format(attrs.story), "--");
			setNullValue("grsqft", localeNumber.format(attrs.ttlsqft) +" sqft", "--");
			setNullValue("resarea", localeNumber.format(attrs.ressqft) +" sqft", "--");
			setNullValue("comarea", localeNumber.format(attrs.comsqft) +" sqft", "--");
			setNullValue("resunit", attrs.resunit, "--");
			setNullValue("comunit", attrs.comunit, "--");
			
			setNullValue("yrb", attrs.AYB, "--");
			setNullValue("zoning", attrs.Zone_1, "--");
			
			//setNullValue("door", attrs.PY02, "--");
			//setNullValue("gym", attrs.PY04, "--");
			//setNullValue("regratio", attrs.PY07, "--");
			setNullValue("nbldg", attrs.nbldg, "--");
			
			setNullValue("nbhd", attrs.NBHD, "--");
			setNullValue("Structure", attrs.Structure, "--");
			setNullValue("mid_fmv", attrs.mid_fmv, "--");
			setNullValue("mid_agi", attrs.mid_agi, "--");
			setNullValue("mid_exp", attrs.mid_exp, "--");
			setNullValue("mid_noi", attrs.mid_noi, "--");
			//setNullValue("mid_cap", attrs.mid_cap, "--");
			setNullValue("count", attrs.count, "--");
			
			
    		setNullValue("bcat", attrs.bcat, "--");
			setNullValue("vactr", vactr_dis, "--");
			//setNullValue("style", attrs.style, "--");
			//setNullValue("constype", attrs.constyp, "--");
			//setNullValue("extwall", attrs.extwall, "--");
			//setNullValue("ovrcnd", attrs.ovrcnd, "--");
			//setNullValue("prox", attrs.prox, "--");

			//setNullValue("basement", attrs.basement , "--");
			//setNullValue("lfrt",  localeNumber.format(attrs.LFRT_DEC) +" ft", "--");
			//setNullValue("ldep", localeNumber.format(attrs.LDEP_DEC) +" ft", "--");
			
			//setNullValue("zoning", attrs.ZONING, "--");

			//setNullValue("salep1", "$"+localeNumber.format(Math.round(attrs.slpric1/1000)*1000), "--");
			//setNullValue("salep2", "$"+localeNumber.format(Math.round(attrs.slpric2/1000)*1000), "--");
			//setNullValue("salep3", "$"+localeNumber.format(Math.round(attrs.slpric3/1000)*1000), "--");
			//setNullValue("mednbhd", "$"+localeNumber.format(Math.round(attrs.mdnbhd/1000)*1000), "--");
			//
		}
		function setNullValue(varName, value, defaultValue){
					if (value == 0 || value ==""||value == "0" ||value == "$0") {
								dojo.attr(varName, "innerHTML", defaultValue);//set for Queens
					}
					else {
								dojo.attr(varName, "innerHTML", value);//set for Queens
					}
		}

		//add for search on click
		function MapClickSearchHanlder(evt){


		  curBL = curBBL.substring(2,curBBL.length);
		  search.value = curBL;
		  dojo.attr("search_input", "value", curBL);
		  //search.search(curBBL);
		  search.search();
		}

		///HOVER FUNCTION
        //listen for when the onMouseOver event fires on the layer
        //when fired, create a new graphic with the geometry from the event.graphic and add it to the maps graphics layer
        layer.on("mouse-over", function(evt){
			closeDialog();
          var t = "<b>${BORO}/${BLOCK}/${LOT}</b><hr><b>DOF Value 2016 Tentative: $</b>${fmv:NumberFormat}<br>";
          var content = esriLang.substitute(evt.graphic.attributes,t);
          var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);
          map.graphics.add(highlightGraphic);

          dialog.setContent(content);

          domStyle.set(dialog.domNode, "opacity", 0.85);
          dijitPopup.open({
            popup: dialog,
            x: evt.pageX,
            y: evt.pageY
          });
          var t2 = "${BORO}/${BLOCK}/${LOT}"; //add for search on click
		  curBBL = esriLang.substitute(evt.graphic.attributes, t2);//add for search on click
       	    map.setMapCursor("pointer"); //Add mouse change at hover
        });
        function closeDialog() {
          map.graphics.clear();
          map.setMapCursor("default"); //set mouse pointer back
          dijitPopup.close(dialog);
        }






		//Show hide info box button;
		var isClicked = false;
		var toggler = new Toggler({
		node: "AboutInfo"
		});
		toggler.hide();
		 on(dom.byId("toggleButton"), "click", function(e){
			if(isClicked===false){
			   var node= dom.byId("AboutInfo");
			   toggler.show();
			   node.style.zIndex = "30";
			  isClicked=true;
		  }
		  else{
			  toggler.hide();
			  var node= dom.byId("AboutInfo");
			  node.style.zIndex = "0";
			  isClicked=false;
		  }
		 });

      });
