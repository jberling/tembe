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


        // 1. test _parseBindExpression
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

        // 2. test bind
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

        // 3. test update context binding
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

        // 4. test update context binding with reaction
        function (def) {

            var frag = container('\
                <div data-bind="person -> log()" data-context>\
                    <span data-bind="@name -> render()"></span>\
                </div>\
            ');

            return "pending";
        },

        // 5. test update binding with a 3 link chain
        function (def) {

            var frag = container('\
                <div data-bind="person -> do1() -> do2()" data-context>\
                </div>\
            ');

            var data = {

                person : {
                    name : "Stephen"
                }
            };

            var reactions = {
                
                do1 : function(value){
                    return value;    
                },
                
                do2 : function(value){
                    if(value.name === "Oscar"){
                        def.resolve("success");
                    }
                }
                
            }

            behave.bindDomNode(frag, reactions).bindData(data);

            data.person = { name:"Oscar" }

            return def;
        },

        // 6. test reaction to property binding
        function (def) {

            var frag = container('\
                <div data-bind="foo -> do1() -> result">\
                </div>\
                <span data-bind="result -> assert()"></span>\
            ');

            var data = {
                foo : "not ready"
            };

            var reactions = {
                
                do1 : function(value){
                    console.log("do1", value)
                    return value;    
                },
                
                assert : function(value){
                    if(value === "ready"){
                        def.resolve("success");
                    }
                }
                
            }

            behave.bindDomNode(frag, reactions).bindData(data);

            data.foo = "ready"
            return def;
        },

        // 7. test parallell reactions
        function (def) {

            var frag = container('\
                <div data-bind="foo -> { do1(); do2() }">\
                    <span data-bind="result -> render()"></span>\
                </div>\
            ');

            return "pending";
        },

        // 8. test several observations
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

        // 9. test dom event observation
        function (def) {

            var frag = container('\
                <button data-bind="!click -> result">Hit me</button>\
                <span data-bind="result -> render()"></span>\
            ');

            return "pending";
        },

        // 10. test dom event observation via delegate
        function (def) {

            var frag = container('\
                <div data-bind="!button:click -> result">\
                    <button>Hit me</button>\
                    <span data-bind="result -> render()"></span>\
                </div>\
            ');

            return "pending";
        },

        // 11. test reaction chain
        function (def) {
            return "pending";
        }

    ]).run();


});