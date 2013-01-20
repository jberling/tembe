define([
    "dojo/Deferred",
    "dojo/dom-construct",
    "lab/behave",
    "dojo/query"
], function(Deferred, domConstruct, behave, query) {

    function showResult(res) {
        if(document && document.body){
            domConstruct.create("div", {
                class:"result " + res,
                innerHTML : res
            }, query("#results")[0], "last")
        } else {
            console.log(res);
        }
    }

    function runTests(tests) {
        var test   = tests.shift(),
            result;

        if (!test) return;

        result = test(new Deferred());

        if (result.then){
            result.then(function(res){
                showResult(res);
                runTests(tests);
            });
        } else {
            showResult(result);
            runTests(tests);
        }
    }

    return {
        register : function (tests) {

            return {
                run : function(){
                    runTests(tests);
                }
            };
        },

        is : function(expected, actual){

            if (expected === actual){
                return "success";
            } else {
                throw expected + " is not equal to " + actual;
            }

        }
    };

});