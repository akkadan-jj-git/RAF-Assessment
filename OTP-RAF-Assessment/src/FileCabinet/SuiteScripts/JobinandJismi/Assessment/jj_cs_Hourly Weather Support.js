/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/currentRecord'],

function(url, currentRecord) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        window.onbeforeunload = null;
    }
    function weatherDataFetch(){
        try{
            let context = currentRecord.get();
            let local = context.getText({ fieldId: 'custpage_locationfilter' });
            let date = context.getText({ fieldId: 'custpage_datefilter' });
            let date2 = context.getValue({ fieldId: 'custpage_datefilter' });
            let month = ("0" + (date2.getMonth() + 1)).slice(-2);
            let day = ("0" + date2.getDate()).slice(-2);
            let year = date2.getFullYear().toString();
            let formattedDate = year + '-' + month + '-' + day;
            console.log('Date@ClientScript', formattedDate);
            if(local && date2){
                let script = url.resolveScript({
                    deploymentId: 'customdeploy_jj_sl_hourly_weather_data',
                    scriptId: 'customscript_jj_sl_hourly_weather_data',
                    params: {
                        loc: local,
                        dat: date,
                        dat2: formattedDate
                    }
                });
                window.location.href = script;
                log.debug('Passed', 'Passed');
            }
        }
        catch(e){
            log.debug('Error@downloadCSV', e.stack + '\n' + e.message);
        }
    }
    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        try{
            let local = scriptContext.currentRecord.getText({ fieldId: 'custpage_locationfilter' });
            let date = scriptContext.currentRecord.getText({ fieldId: 'custpage_datefilter' });
            let date2 = scriptContext.currentRecord.getValue({ fieldId: 'custpage_datefilter' });
            let month = ("0" + (date2.getMonth() + 1)).slice(-2);
            let day = ("0" + date2.getDate()).slice(-2);
            let year = date2.getFullYear().toString().slice(-2);
            let formattedDate = year + '-' + month + '-' + day;
            console.log('Date@ClientScript', formattedDate);
            if(local && date && scriptContext.currentRecord.fieldId === 'custpage_getData'){
                document.location = url.resolveScript({
                    deploymentId: 'customdeploy_jj_sl_hourly_weather_data',
                    scriptId: 'customscript_jj_sl_hourly_weather_data',
                    params: {
                        conv: formattedDate,
                        loc: local,
                        dat: date,
                        dat2: '2024-09-22'
                    }
                })
            }
        }
        catch(e){
            log.debug('Error@downloadCSV', e.stack + '\n' + e.message);
        }
    }

    return {
        pageInit: pageInit,
        weatherDataFetch: weatherDataFetch
    };
    
});
