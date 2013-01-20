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


        // test _parseBindExpression
        function () {

            var result = behave._parseBindExpression("\
                    @foo -> do-foo(humle, dumle); \
                    \
                "),
                statement = result.statements[0],
                step      = statement.steps[0]
            ;



            t.is("@foo", step.value);
            t.is("PROPERTY", step.type);
            t.is(0, step.args.length);

            step = statement.steps[1];
            t.is("do-foo", step.value);
            t.is("REACTION", step.type);
            t.is("humle", step.args[0]);

            return "success";
        },

        // test bind
        function () {

            var frag = container('\
                <div data-context=uiState>\
                    <dl data-bind=person data-context>\
                        <dt>Name</dt>\
                        <dd>\
                            <span data-bind="@name -> render()"></span>\
                        </dd>\
                        <dt>Eyes</dt>\
                        <dd>\
                            <span data-bind="@face.eyes -> render()"></span>\
                        </dd>\
                    </dl>\
                    <div data-context=@user>\
                        <span data-bind="@name -> render()"></span>\
                    </div>\
                </div>\
            ');

            domConstruct.place(frag, document.body);

            var data = {

                person : {
                    name : "Boris",
                    face : {
                        eyes : "blue"
                    }
                },

                uiState : {
                    user : {
                        name : "Admin"
                    }
                }
            };

            var bound = behave.bindDomNode(frag).bindData(data);

            var spans = query("span", frag);

            window.data = data;

            t.is("Boris", spans[0].innerHTML);
            t.is("blue", spans[1].innerHTML);
            t.is("Admin", spans[2].innerHTML);

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