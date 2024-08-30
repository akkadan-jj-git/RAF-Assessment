/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/https', 'N/file'],
    
    (serverWidget, https, file) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try{
                if(scriptContext.request.method === 'GET'){
                    let form = serverWidget.createForm({
                        title: 'Localized Hourly Weather Data'
                    });
                    let filterGroup = form.addFieldGroup({
                        id: 'custpage_filtersgroup',
                        label: 'Filters'
                    });
                    // Filter 1
                    let location = form.addField({
                        id: 'custpage_locationfilter',
                        label: 'Enter a Location',
                        type: serverWidget.FieldType.TEXT,
                        container: 'custpage_filtersgroup'
                    });
                    // Filter 2
                    let date = form.addField({
                        id: 'custpage_datefilter',
                        label: 'Enter a Date',
                        type: serverWidget.FieldType.DATE,
                        container: 'custpage_filtersgroup'
                    });
                    form.addSubmitButton({
                        label: 'Get Weather Data'
                    });
                    let subList = form.addSublist({
                        id: 'sublist_weather',
                        label: 'Weather Data',
                        type: serverWidget.SublistType.LIST
                    });
                    subList.addField({
                        id: 'custpage_time',
                        label: 'Time',
                        type: serverWidget.FieldType.TEXT
                    });
                    subList.addField({
                        id: 'custpage_temp',
                        label: 'Temperature',
                        type: serverWidget.FieldType.TEXT
                    });
                    subList.addField({
                        id: 'custpage_weather',
                        label: 'Weather',
                        type: serverWidget.FieldType.TEXT
                    });
                    form.addButton({
                        id: 'download_csv',
                        label: 'Download as CSV',
                        functionName: 'downloadCSV'
                    });
                    scriptContext.response.writePage(form);
                }
                else{
                    let location = scriptContext.request.parameters.custpage_locationfilter;
                    let date = scriptContext.request.parameters.custpage_datefilter;
                    log.debug('Location', location);
                    log.debug('Date', date);
                    let weatherData = weatherDataFetch(location, date);
                    
                    let form = serverWidget.createForm({
                        title: 'Localized Hourly Weather Data'
                    });
                    let filterGroup = form.addFieldGroup({
                        id: 'custpage_filtersgroup',
                        label: 'Filters'
                    });
                    // Filter 1
                    let locationField = form.addField({
                        id: 'custpage_locationfilter',
                        label: 'Enter a Location',
                        type: serverWidget.FieldType.TEXT,
                        container: 'custpage_filtersgroup'
                    });
                    // Filter 2
                    let dateField = form.addField({
                        id: 'custpage_datefilter',
                        label: 'Enter a Date',
                        type: serverWidget.FieldType.DATE,
                        container: 'custpage_filtersgroup'
                    });
                    form.addSubmitButton({
                        label: 'Get Weather Data'
                    });
                    let subList = form.addSublist({
                        id: 'sublist_weather',
                        label: 'Weather Data',
                        type: serverWidget.SublistType.LIST
                    });
                    subList.addField({
                        id: 'custpage_time',
                        label: 'Time',
                        type: serverWidget.FieldType.TEXT
                    });
                    subList.addField({
                        id: 'custpage_temp',
                        label: 'Temperature',
                        type: serverWidget.FieldType.TEXT
                    });
                    subList.addField({
                        id: 'custpage_weather',
                        label: 'Weather',
                        type: serverWidget.FieldType.TEXT
                    });
                    form.addButton({
                        id: 'download_csv',
                        label: 'Download as CSV',
                        functionName: downloadCSV()
                    });
                    weatherData.forEach(function(data, i){
                        subList.setSublistValue({
                            sublistId: 'sublist_weather',
                            fieldId: 'custpage_time',
                            line: i,
                            value: data.time
                        });
                        subList.setSublistValue({
                            sublistId: 'sublist_weather',
                            fieldId: 'custpage_temp',
                            line: i,
                            value: data.temperature
                        });
                        subList.setSublistValue({
                            sublistId: 'sublist_weather',
                            fieldId: 'custpage_weather',
                            line: i,
                            value: data.weather
                        });
                    });
                    function weatherDataFetch(location, date){
                        // let api1 = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/[' + location + ']/[' + date + ']?key=f197cb2982a2864db163ba69233d9a8801982233098ff291e6e7203464a43dce';
                        let api = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/'+location+'/'+date+'?unitGroup=metric&key=f197cb2982a2864db163ba69233d9a8801982233098ff291e6e7203464a43dce&contentType=json'
                        let response = https.get({
                            url: api
                        });
                        log.debug('Output', response.body);
                        let data = JSON.parse(response);
                        let weatherData = [];
                        data.forEach(function(hour){
                            weatherData.push({
                                time: hour.time,
                                temperature: hour.temp,
                                weather: hour.weather
                            });
                        });
                        return weatherData;
                    }
                    scriptContext.response.writePage(form);
                }
                function downloadCSV() {
                    let csvContent = "Time, Temperature, Description \n";
            
                    let sublist = document.getElementById('sublist_weather');
                    for (let i = 0; i < sublist.rows.length; i++) {
                        let row = sublist.rows[i];
                        let time = row.cells[0].innerText;
                        let temperature = row.cells[1].innerText;
                        let description = row.cells[2].innerText;
                        csvContent += time + ',' + temperature + ',' + description + '\n';
                    }
            
                    let csvFile = file.create({
                        name: 'Daily Weather Data.csv',
                        fileType: file.Type.CSV,
                        contents: csvData
                    });
                    csvFile.folder = -15;
                    let fileId = csvFile.save();
                }
            
            }
            catch(e){
                log.debug('Error@onRequest', e.stack);
            }
        }

        return {onRequest}

    });
