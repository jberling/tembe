define([
    "lab/behave",
    "./test-utils",
    "dojo/Deferred",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/query",
    "dojo/dom-attr"
], function(behave, t, Deferred, domConstruct, on, query, domAttr){

    function container (innerHTML) {

       return domConstruct.create("div",
           { id:"container", innerHTML:innerHTML });

    }

    t.register([

//        // test prepare
//        function (def) {
//            var frag = container('\
//                <div data-bind=uiState>\
//                    <dl data-bind=person>\
//                        <dt>Name</dt>\
//                        <dd data-render=@name></dd>\
//                    </dl>\
//                    <div data-bind=@user>\
//                        <div data-render=@name></div>\
//                    </div>\
//                </div>\
//            ');
//
//            var bound = behave.bindDomNode(frag).prepare();
//
//            var qNodes = query("[data-q]", frag);
//
//            t.is("person.name", qNodes[0].dataset.q);
//            t.is("uiState.user.name", qNodes[1].dataset.q);
//
//
//            return "success";
//        },

        // test bind
        function (def) {

            var frag = container('\
                <div data-bind=uiState>\
                    <dl data-bind=person>\
                        <dt>Name</dt>\
                        <dd>\
                            <span data-bind=@name data-react=render></span>\
                        </dd>\
                    </dl>\
                    <div data-bind=@user>\
                        <div data-bind=@name data-react=render></div>\
                    </div>\
                </div>\
            ');

            domConstruct.place(frag, document.body);

            var data = {

                person : {
                    name : "Boris"
                },

                uiState : {
                    user : {
                        name : "Admin"
                    }
                }
            };

            var bound = behave.bindDomNode(frag).bindData(data);

            var qNodes = query("[data-render]", frag);

            window.data =  data;

            console.log(frag);

//            t.is("person.name", qNodes[0].dataset.render);
//            t.is("uiState.user.name", qNodes[1].dataset.render);

            return "success";
        },

        // test observe
        function (def) {
            return "pending";
        },

        // test release
        function (def) {
            return "pending";
        }

    ]).run();


});