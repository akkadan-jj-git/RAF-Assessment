/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/https', 'N/file'],
    
    (serverWidget, https, file) => {
        function downloadCSV(csvData) {
            try{
                let csvFile = file.create({
                    name: 'Daily Weather Data.csv',
                    fileType: file.Type.CSV,
                    contents: csvData
                });
                csvFile.folder = -15;
                let fileId = csvFile.save();
                return fileId;
            }
            catch(e){
                log.debug('Error@downloadCSV', e.stack + '\n' + e.message);
            }
        }
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
                    form.clientScriptFileId = 4073;
                    let filterGroup = form.addFieldGroup({ id: 'custpage_filtersgroup', label: 'Filters' });
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
                    let subList = form.addSublist({ id: 'sublist_weather', label: 'Weather Data', type: serverWidget.SublistType.LIST });
                    subList.addField({ id: 'custpage_time', label: 'Time', type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: 'custpage_datetimeepoch', label: 'Date Time Epoch', type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: 'custpage_temp', label: 'Temperature', type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: 'custpage_feelslike', label: 'Feels Like', type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: "custpage_humidity", label: "Humidity", type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: "custpage_dew", label: "Dew", type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: "custpage_precip", label: "Precipitation", type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: "custpage_precipprob", label: "Precipitation Probability", type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: "custpage_snow", label: "Snow", type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: "custpage_snowdepth", label: "Snow Depth", type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: "custpage_preciptype", label: "Precipitation Type", type: serverWidget.FieldType.TEXT });
                    subList.addField({ id: "custpage_windgust", label: "Wing Gust", type: serverWidget.FieldType.TEXT });
                    form.addButton({ id: 'custpage_getData', label: 'Get Weather Data', functionName: 'weatherDataFetch' });
                    form.addSubmitButton({ label: 'Download CSV' });

                    let location = scriptContext.request.parameters.loc || null;
                    let date = scriptContext.request.parameters.dat2 || null;
                    let date2 = scriptContext.request.parameters.dat || null;
                    let month = scriptContext.request.parameters.conv || null;
                    log.debug('Month@Suitelet', month);
                    if(location && date){
                        locationField.defaultValue = location;
                        dateField.defaultValue = date2;
                        let headersRequest = {
                            'Content-Type': 'application/json'
                        }
                        let apiURL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"+location+"/"+date+"/"+date+"/?unitGroup=metric&key=FSMLEAR6GSNWSGGTDC4FDU9P2&contentType=json";
                        let response = https.request({
                            method: https.Method.GET,
                            url: apiURL,
                            headers: headersRequest
                        });
                        let weatherData;
                        let csvList = "Time, Temperature, Wind Speed, Humidity, Condition, Pressure, Precipitation, Visibility, Cloud Cover\n";
                        if(response.code === 200){
                            weatherData = JSON.parse(response.body);
                            let daily = weatherData["days"];
                            let hourly = daily[0].hours;
                            let data;
                            for(let i = 0; i < hourly.length; i++){
                                data = hourly[i];
                                subList.setSublistValue({ id: 'custpage_time', line: i, value: data['datetime'] });
                                csvList += data['datetime'] + ', ';
                                subList.setSublistValue({ id: 'custpage_temp', line: i, value: data['temp'] });
                                csvList += data['temp'] + ', ';
                                subList.setSublistValue({ id: 'custpage_datetimeepoch', line: i, value: data['datetimeEpoch'] });
                                csvList += data['datetimeEpoch'] + ', ';
                                subList.setSublistValue({ id: 'custpage_humidity', line: i, value: data['humidity'] });
                                csvList += data['humidity'] + ', ';
                                subList.setSublistValue({ id: 'custpage_feelslike', line: i, value: data['feelslike'] });
                                csvList += data['feelslike'] + ', ';
                                subList.setSublistValue({ id: 'custpage_dew', line: i, value: data['dew'] });
                                csvList += data['dew'] + ', ';
                                subList.setSublistValue({ id: 'custpage_precipprob', line: i, value: data['precipprob'] });
                                csvList += data['precipprob'] + ', ';
                                subList.setSublistValue({ id: 'custpage_precip', line: i, value: data['precip'] });
                                csvList += data['precip'] + ', ';
                                subList.setSublistValue({ id: 'custpage_snow', line: i, value: data['snow'] });
                                csvList += data['snow'] + ', ';
                                subList.setSublistValue({ id: 'custpage_snowdepth', line: i, value: data['snowdepth'] });
                                csvList += data['snowdepth'] + ', ';
                                subList.setSublistValue({ id: 'custpage_preciptype', line: i, value: data['preciptype'] }) || 'null';
                                csvList += data['preciptype'] + ', ';
                                subList.setSublistValue({ id: 'custpage_windgust', line: i, value: data['windgust'] });
                                csvList += data['windgust'] + '\n';
                            }
                            let csvField = form.addField({
                                id: 'custpage_csv',
                                label: 'CSV Variable',
                                type: serverWidget.FieldType.LONGTEXT
                            });
                            csvField.updateDisplayType({
                                displayType: serverWidget.FieldDisplayType.HIDDEN
                            });
                            csvField.defaultValue = csvList;
                        }
                        else{
                            log.debug('Error@Fetching Data', 'Data not fetched');
                        }
                    }
                    scriptContext.response.writePage(form);
                }
                else if(scriptContext.request.method === 'POST'){
                    let csvContent = scriptContext.request.parameters.custpage_csv;
                    let csvFileId = downloadCSV(csvContent);
                    scriptContext.response.write('CSV file created. File Id: ' + csvFileId);
                }      
            }
            catch(e){
                log.debug('Error@onRequest', e.stack + '\n' + e.message);
            }
        }
        return {onRequest}

    });
