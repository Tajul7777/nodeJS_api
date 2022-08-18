/**
 * Created by Md Tajul ISlam on 18.08.2022.
 */

 (function(overview) {
    'use strict';


    document.body.classList.add('newStyle');
    document.body.classList.add('dark');


    featureUtil.checkForFeatureDeactivation();



    /* var overviewObserver = */(function() {

        var storedObs = viewsModel.getObserverByViewId('overview');

        if (storedObs) {
            return storedObs;
        }


        // -- initialise new observer

        var newObs = new ViewObserver('overview');
        newObs.eventsMap = {
            'plantIdsChanged': function() {
                if (updateBe4visionOnChangedPlantPermissions_1356 === true) {

                    console.log('--- overviewObserver  plantIdsChanged callback');

                    var plantSelect = getElById("Plant_Options");
                    plantSelect.textContent = '';

                    fillPlantSelectEl(plantSelect);
                }
            }
        };

        // -- add new observer to views state model

        viewsModel.addObserver(newObs);


        return newObs;
    })();



    var overviewUserInfo = {
        commissioningDate: '.info-com-date',
        yieldDegradation: '.info-degradation',

        controlCommissioningDateInfo: function(display ){
            this.controlInfo(this.commissioningDate, display);
        },
        controlYieldDegradationInfo: function(display) {
            this.controlInfo(this.yieldDegradation, display);
        },
        controlInfo: function(selector, display) {
            if (typeof display !== 'boolean') {
                console.error('Parameter "display" missing or of wrong type.');
                return;
            }

            var infoIcons = document.querySelectorAll(selector);
            if (!infoIcons.length) {
                console.error('No info icons found.');
                return;
            }

            infoIcons.forEach( function(icon) {
                if (display === true && icon.classList.contains('no-show')) {
                    icon.classList.remove('no-show');
                    be4Tooltips.enableTooltip(icon);
                }
                if (display === false && !icon.classList.contains('no-show')) {
                    be4Tooltips.disableTooltip(icon);
                    icon.classList.add('no-show');
                }
            });
        },

        hideIcons: function() {
            this.controlInfo(this.commissioningDate + ', ' + this.yieldDegradation, false);
        }
    };



    var manageData = {

        installedDCPower: 0,
        getInstalledDCPowerInkWp: function() {
            return this.installedDCPower * 0.001;
        },
        nominalACPower: 0,

        configuredEstYield: null,
        estYieldDegradation: 0,
        commissioningYear: null,

        sunRiseStr: "",
        sunSetStr: "",

        refreshData: function() {
            var plantSelectEl = plantSelection.getPlantSelectEl();
            // prevent error message when choosing different menu item
            if (!plantSelectEl) {
                return;
            }
            // check for filled plant select - e.g. after connection has been interrupted
            plantSelection.fillPlantSelectEl(plantSelectEl);


            if (plantSelectEl.value !== plantInfoDict.getPIdOfSelectedPlant()) {
                console.error('manageData.refreshData  Mismatch between value of plantSelectEl and selected plantid of plantInfoDict!');

                // todo
            }

            var plant = plantInfoDict.getSelectedPlantObj();

            /*
            var upid = plant.upid;  // var upid = plantSelectEl.value;
            var host = plant.dbhost;
            var plantIndex = plant['plant.index'];
            */

            var fromTS = dateFunctions.getLocalDateObjectFromDatePicker('#datepicker1');
            var fromTsFormattedDateStr = dateFunctions.getISODateTimeString(fromTS);

            actualDayChart.loadData(plant, fromTsFormattedDateStr);
        },

        getDataAsyncOverview: function(reqStr, host) {
            // console.log("requestStr: " + reqStr);

            var convertedRequest = xmlService.convert(reqStr,1);
            sessionStorage.setItem("xml_conv_req", convertedRequest);


            return $.ajax({
                type: "POST",
                url: connect.getCompleteUrl(host),
                dataType: 'text',
                timeout: 30000,
                data: convertedRequest,
                beforeSend: function() {
                    if (!navigator.onLine) {
                        console.log('getDataAsyncOverview ov2 navigator.onLine: ', navigator.onLine, '   cancel request');

                        return false;
                    }
                }
            });
        },
        processXML: function(resp) {
            var plants = $(resp).find('plant');
            var plant, values, dTags;

            var data = [];
            var valueTypes, dataTag, dataSetObj;

            for (var p = 0; p < plants.length; p++) {
                plant = plants[p];
                // var pid = plant.getAttribute("upid");
                values = $(plant).find("value");
                dTags = $(plant).find("d");


                valueTypes = [];
                for (var v = 0; v < values.length; v++) {
                    valueTypes.push(values[v].getAttribute('type'));
                }


                for (var d = 0; d < dTags.length; d++) {
                    dataTag = dTags[d];

                    dataSetObj = {};
                    dataSetObj.date = dataTag.getAttribute('ts');

                    for (var vt = 0; vt < valueTypes.length; vt++) {
                        var deviceValue = valueTypes[vt];
                        var value = dataTag.getAttribute(deviceValue);

                        if (value !== '') {
                            dataSetObj[deviceValue] = parseFloat(value);
                        } else {
                            dataSetObj[deviceValue] = null;
                        }
                    }
                    data.push(dataSetObj);
                }
            }


            console.table('processXML data 1: ', data);

            // cutDataFrom3amTo10pm
            data.splice(0, 4 * 3);
            data.splice(4 * 19, 4 * 2);

            console.table('processXML data 2: ', data);
            return data;
        },


        determineLatestValueForPerformanceOverview: function(chartData, dataKey, valueKey) {
            var dataSetsAmount = chartData.length - 1;
            for (var ds = dataSetsAmount; ds >= 0; ds--) {
                var lastDataSet = chartData[ds];

                if (lastDataSet.hasOwnProperty(dataKey) && lastDataSet[dataKey] !== null) {
                    this[valueKey] = lastDataSet[dataKey];
                    break;
                }
            }
        },

        performanceRatioValue: 0,
        getPerformanceRatioValueForProgressBar: function() {
            var prInPercent = this.performanceRatioValue * 100 / 120;
            if (prInPercent > 100) {
                prInPercent = 100;
            }
            return prInPercent;
        },

        maxRad: 1200,
        radiationValue: 0,
        getRadiationValueForProgressBar: function() {
            return this.radiationValue / this.maxRad * 100;
        },

        acPowerValue: 0,
        getACPowerValueForProgressBar: function() {
            return this.acPowerValue * 1000 / this.installedDCPower * 100;
        }
    };


    var chartPrototype = {
        // selector: "",

        chart: null,
        chartData: null,

        // resolution: '',
        dateFormats: {
            day: "dd.MM.",
            day_periodChange: "dd.MM.yy",
            month: "MM''yy",
            month_periodChange: "MM''yyyy",
            year: "yyyy"
        },

        // date axis has its own date format objects
        setDateAxisDateFormat: function(dateAxis) {

            dateAxis.dateFormats.setKey(this.period, this.dateFormats[this.period]);

            if (this.period === 'day' || this.period === 'month') {
                dateAxis.periodChangeDateFormats.setKey(this.period,
                    this.dateFormats[this.period + '_periodChange']
                );
            }
        },

        loadIndicator: null,
        loadIcon: null,
        indicatorInterval: 0,

        loadData: function(projectData, fromTsFormattedDateStr) {
            var getActualDayReqStr = this.getRequestStr(projectData.upid, projectData['plant.index'], fromTsFormattedDateStr);
            var doneCb = this.loadDataDone;

            var promise = manageData.getDataAsyncOverview(getActualDayReqStr, projectData.dbhost);
            promise.done(doneCb);
        },


        // todo: no copy but only reference
        configureTooltipOfSeriesItem: amChartsLib.tooltipOfSeriesItem.configureTooltipOfSeriesItem,

        configureZoomButton: amChartsLib.configureZoomButton,
        configureLegend: amChartsLib.configureLegend
    };
    console.log('mixin amChartsLib');
    mixin(chartPrototype, amChartsLib.loadIndication);
    mixin(chartPrototype, amChartsLib.axesUtils);
    mixin(chartPrototype, amChartsLib.seriesItemUtils);



    var actualDayChart = Object.create(chartPrototype);
    mixin(actualDayChart, {
        selector: "#actual-day-chart",

        period: 'day',

        /*
        loadData: function(projectData, fromTsFormattedDateStr) {
            var getActualDayReqStr = this.getRequestStr(projectData.upid, projectData['plant.index'], fromTsFormattedDateStr);

            var promise = manageData.getDataAsyncOverview(getActualDayReqStr, 30000, projectData.dbhost);
            promise.done( function(resp, textStatus, jqXHR) {

                var $error = $(resp).find('error');
                if (!$error.length) {

                    this.prepareData(resp);
                    this.createChart();

                } else {
                    // todo
                    if (this.chart !== null) {
                        this.chart.data = [];
                    }
                }
            }).fail();
        },
        */
        getRequestStr: function(pid, plantIndex, fromTsFormattedDateStr) {
            return '<xml>' +
                '<req job_id="" xml_id="" type="get_predefined_daily_plant_data" ' +
                'id="GET_PREDEFINED_DAILY_PLANT_DATA" ' +
                'plant_id="' + plantIndex + '">' +
                '<getPredefinedDailyPlantData>' +
                '<plants>' +
                '<plant upid="' + pid + '"></plant>' +     // P1602505
                '</plants>' +
                '<time tz="plant" fromTS="' + fromTsFormattedDateStr + '"/>' +    // 2017-01-27 10:39:00
                '</getPredefinedDailyPlantData>' +
                '</req>' +
                '</xml>';
        },

        loadDataDone: function(resp, textStatus, jqXHR) {
            var $error = $(resp).find('error');
            if (!$error.length) {

                this.prepareData(resp);
                this.createChart();

            } else {
                // todo
                if (this.chart !== null) {
                    this.chart.data = [];
                }
            }
        },
        prepareData: function(resp) {
            var dataOfActualDay = manageData.processXML(resp);

            if (isNonEmptyArray(dataOfActualDay) === false) {
                // todo
                return;
            }

            this.chartData = dataOfActualDay;

            this.convertDates();

            manageData.determineLatestValueForPerformanceOverview(this.chartData, 'PRAD', 'radiationValue');
            manageData.determineLatestValueForPerformanceOverview(this.chartData, 'PAC', 'acPowerValue');
        },

        createChart: function() {

            var axisLabelACPower = translateKey("AC_POWER_IN_KW");
            var trackNameDataLabelACPower = translateKey("AC_POWER");

            var axisLabelPerformanceRatio = translateKey("PERFORMANCE_RATIO_IN_PERCENT");
            var trackNameDataLabelPerformanceRatio = translateKey("PERFORMANCE_RATIO");

            var axisLabelRadiationPower = translateKey("RADIATION_POWER_IN_WM2");
            var trackNameDataLabelRadiationPower = translateKey("OVERVIEW_RADIATION_POWER");

            var translatePlantTime = translateKey("PLANT_TIME");


            // todo
            var am4core = window.am4core;
            var am4charts = window.am4charts;

            var chartEl = this.contentEl.querySelector('.chart');
            this.chart = am4core.create(chartEl, am4charts.XYChart);

            this.chart.responsive.enabled = true;
            this.chart.seriesContainer.zIndex = -1;


            // amChartsLib.axesUtils.convertDates();
            this.chart.data = this.chartData;


            /* create axes */

            var dateAxis = this.createDateAxis();
            this.setDateAxisDateFormat(dateAxis);


            /* create and configure series */



            /* configure legend and the zoom out button */

            if (this.legend === 'show') {
                amChartsLib.configureLegend.call(this, false);
            }
            amChartsLib.configureZoomButton.call(this);
        },
        setDateAndNumberFormat: function() {
            // locale settings - all settings depending on language and/ or state
            this.chart.numberFormatter.numberFormat = "#,###.#";

            // this.chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";     // instead of .convertDates -> here needed for calculation of est. yield

            if (getLoginLanguage() === 'de') {
                this.setGermanChartLocales();
            }

            // for custom date format - only fits in tooltips
            this.chart.dateFormatter.dateFormat = this.dateFormats[this.period];

            // https://www.amcharts.com/docs/v4/reference/dateformatter/#timezone_property
            // sub types might be limited to one pid
            // if (this.pid) {
            // var plantParams = plantInfoDict.getPlantObjByPlantId(this.pid);
            var plantParams = plantInfoDict.getSelectedPlantObj();
            this.chart.dateFormatter.timezone = plantParams['plant.timezone.identifier'];
            // }
        },
        setGermanChartLocales: function() {
            // https://www.amcharts.com/docs/v4/concepts/locales/

            var germanLocale = window.am4lang_de_DE;
            this.chart.language.locale = germanLocale;

            this.chart.dateFormatter.language.locale = germanLocale;
        },


        determineDaylightMarking: function(pid) {
            var daylightMarking = null;
            var sunRiseStr = overviewData.sunRiseStr;
            var sunSetStr = overviewData.sunSetStr;


            return daylightMarking;
        }
    });



    var plantSelection = {

        handleEvent: function(e) {
            e.stopPropagation();

            var curTarget = e.currentTarget;
            if (curTarget.nodeName === 'SELECT') {
                this.selectPlant(e);
            }
            if (curTarget.nodeName === 'BUTTON') {
                this.changePlant(e);
            }
        },

        registerHandler: function() {
            var selectEl = this.getPlantSelectEl();
            selectEl.addEventListener('change', this);

            var self = this;
            var container = selectEl.closest('.additional_bar');
            var buttons = container.querySelectorAll('button');
            buttons.forEach( function(btn) {
                btn.addEventListener('change', self);
            });
        },
        getPlantSelectEl: function() {
            return document.getElementById('Plant_Options');
        },
        fillPlantSelectEl: function(selectEl) {
            if (selectEl === undefined) {
                selectEl = this.getPlantSelectEl();
            }

            var plantsSortedByPlantName = plantInfoDict.getSortedPlantNames({key: 'plantName'});

            var selectedPlantId = plantInfoDict.getPIdOfSelectedPlant();
            if (!selectedPlantId) {
                plantInfoDict.setSelectedPlant(plantsSortedByPlantName[0].upid);
            }

            var plant;
            for (var i = 0, numOfPlants = plantsSortedByPlantName.length; i < numOfPlants; i++) {
                plant = plantsSortedByPlantName[i];
                if (plant.hasOwnProperty('upid')) {
                    $(selectEl).append('<option value="' + plant.upid + '">' + plant.plantName + '</option>');
                }
            }

            selectEl.value = plantInfoDict.getPIdOfSelectedPlant();
            overviewData.updatePlantInfoData();
        },
        selectPlant(e) {
            var selectEl = e.currentTarget;
            plantInfoDict.setSelectedPlant(selectEl.value);

            overviewData.resetData();
            overviewData.resetPlantInfoData();
            overviewData.updatePlantInfoData();

            setTimeout( function() {
                // loadPlantData2();
                manageData.refreshData();
                refreshCoreData();
            }, 0);
        },

        delayLoadOnChangedPlantOv: 0,
        changePlant: function(e) {    // upOrDown
            var self = this;
            clearTimeout(self.delayLoadOnChangedPlantOv);

            var clickedBtnId = this.id;
            var upOrDown = clickedBtnId.replace('_plant','');

            // var plantSelectEl = getElById("Plant_Options");
            var plantSelectEl = this.getPlantSelectEl();
            var plantSelectOpts = plantSelectEl.options;


            // console.log('changePlant initial plantSelect.selectedIndex: ', plantSelectEl.selectedIndex);
            if (upOrDown === 'previous') {
                if (plantSelectEl.selectedIndex > 0) {
                    plantSelectEl.selectedIndex -= 1;
                } else {
                    plantSelectEl.selectedIndex = plantSelectOpts.length - 1;
                }
            } else {
                if (plantSelectEl.selectedIndex < plantSelectOpts.length - 1) {
                    plantSelectEl.selectedIndex += 1;
                } else {
                    plantSelectEl.selectedIndex = 0;
                }
            }

            plantInfoDict.setSelectedPlant(plantSelectEl.value);


            overviewData.resetData();
            overviewData.resetPlantInfoData();
            overviewData.updatePlantInfoData();

            this.delayLoadOnChangedPlantOv = setTimeout( function() {
                // loadPlantData2();
                manageData.refreshData();

                refreshCoreData();
            }, 275);
        }
    };


    var view = {

        init: function() {

            this.initialiseDatePicker();

            plantSelection.registerHandler();

            $("#button_refresh2").off('click').on('click', function(e) {
                e.stopPropagation();

                if (parseInt(localStorage.getItem("autorefresh_interval"),10) > 0) {
                    overviewData.resetData();

                    refreshAllPlants2();
                }
            });


            // chart header handler
            $('.export').off('click').on('click', prepareExport2);
        },

        initialiseDatePicker: function() {

        }
    };



    //overview.actualDayChart = actualDayChart;
    new actualDayChart();


})(window.overview = window.overview || {});

