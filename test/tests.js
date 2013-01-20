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

       return domConstruct.create(
           "div",
           { class:"container", innerHTML:innerHTML },
           query("#sandbox")[0]
       );

    }

    t.register([


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

            t.is("Boris", spans[0].innerHTML);
            t.is("blue", spans[1].innerHTML);
            t.is("Admin", spans[2].innerHTML);

            return "success";
        },

        // test update context binding
        function (def) {

            var frag = container('\
                <div data-bind=person data-context>\
                    <span data-bind="@name -> render()"></span>\
                    <span data-bind="@age -> render()"></span>\
                </div>\
            ');

            var data = {
                person : {
                    name : "Angus",
                    age  : 45
                }
            };

            window.data = data;

            var bound = behave.bindDomNode(frag).bindData(data);

            var spans = query("span", frag);

            t.is("Angus", spans[0].innerHTML);
            t.is("45", spans[1].innerHTML);

            data.person = {
                name : "Sixten",
                age  : 73
            };

            t.is("Sixten", spans[0].innerHTML);
            t.is("73", spans[1].innerHTML);

            return "success";
        },

        // test update context binding with reaction
        function (def) {

            var frag = container('\
                <div data-bind="person -> log()" data-context>\
                    <span data-bind="@name -> render()"></span>\
                </div>\
            ');

            return "pending";
        },

        // test update binding with a 3 link chain
        function (def) {

            var frag = container('\
                <div data-bind="person -> do1() -> do2()" data-context>\
                </div>\
            ');

            return "pending";
        },

        // test reaction to property binding
        function (def) {

            var frag = container('\
                <div data-bind="foo -> do1() -> result">\
                    <span data-bind="result -> render()"></span>\
                </div>\
            ');

            return "pending";
        },

        // test parallell reactions
        function (def) {

            var frag = container('\
                <div data-bind="foo -> { do1(); do2() }">\
                    <span data-bind="result -> render()"></span>\
                </div>\
            ');

            return "pending";
        },

        // test several observations
        function (def) {

            var frag = container('\
                <div data-bind="\
                    foo -> do-foo() -> foo-result; \
                    bar -> do-bar() -> bar-result;">\
                    <span data-bind="foo-result -> render()"></span>\
                    <span data-bind="bar-result -> render()"></span>\
                </div>\
            ');

            return "pending";
        },

        // test dom event observation
        function (def) {

            var frag = container('\
                <button data-bind="!click -> result">Hit me</button>\
                <span data-bind="result -> render()"></span>\
            ');

            return "pending";
        },

        // test dom event observation via delegate
        function (def) {

            var frag = container('\
                <div data-bind="!button:click -> result">\
                    <button>Hit me</button>\
                    <span data-bind="result -> render()"></span>\
                </div>\
            ');

            return "pending";
        },

        // test reaction chain
        function (def) {
            return "pending";
        }

    ]).run();


});