define([
    "dojo/query",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/NodeList-traverse"
], function(query, domAttr, domStyle){

    var reactions = {

        render : function(value, re){
            re.observer.innerHTML = value;
        },

        "visible-if" : function(value, re){
            domStyle.set(re.observer, "display", value ? "block" : "none");
        },

        log : function(value){
            console.log("log reaction");
            console.log(value);
            return value;
        }

    }

    function parseBindExpression(expr){

        var statements;

        function trim (str){ return str.trim() }
        function removeEmptyStr (str) { return str; }

        statements = expr.split(";").map(trim).filter(removeEmptyStr);

        function tryRegex (regex, func) {
            var match = source.match(regex),
                step  ={ args:[] };

            //continue
            if (match) {
                match  = match[0];
                source = source.slice(match.length);

                func(match, step);

                return step;
            } else {
                return false;
            }
        }

        function parseStep (source) {
            var match, args = [], argsSource,
                propertyRegex = /^@?[a-zA-Z0-9_\-\.]+$/,
                reactionRegex = /^[a-zA-Z0-9_\-]+\([^\)]*\)$/,
                eventRegex    = /^![a-zA-Z0-9_\-]+ / //todo
            ;

            if(source.match(propertyRegex)){
                return {
                    type  : "PROPERTY",
                    value : source,
                    args  : args
                }
            } else if (source.match(reactionRegex)) {

                argsSource = source.match(/\(([^\)]*)\)/)[1];

                if(argsSource){
                    args = argsSource.split(",").map(trim);
                }

                return {
                    type  : "REACTION",
                    value : source.match(/^[a-zA-Z0-9_\-]+/)[0],
                    args  : args
                };
            }
        }

        function parseStatement (source) {

            var steps     = source.split("->").map(trim).filter(removeEmptyStr),
                statement = {
                    steps : steps.map(parseStep)
                };

            return statement;
        }

        statements = statements.map(parseStatement);

        return {
            statements:statements
        };
    }

    function queryObject (obj, q) {
        return q.replace(/\[/g, ".[")
            .split(".")
            .reduce(function(val, key){
                if(key.match(/^\[/)) {
                    key = key.slice(1, key.length-1)
                }
                return val[key];
            }, obj);
    }

    function createObservableProperty (propertyName, obj, callback){

        var original        = obj[propertyName],
            placeHolderName = "$observed$_" + propertyName;

        Object.defineProperty(obj, propertyName, {
            get : function(){
                return this[placeHolderName];
            },
            set : function(val){
                this[placeHolderName] = val;
                callback(val);
            }
        });

        obj[placeHolderName] = original;

    }

    function DomNodeConnection (domNode) {
        this.domNode = domNode;
    }

    DomNodeConnection.prototype.bindData = function(data){

        var bindNodes = query("[data-bind]", this.domNode);

        if (domAttr.has(this.domNode, "data-bind")){
            bindNodes.unshift(this.domNode);
        }

        function handleBindings(domNode){

            var bindings = parseBindExpression(
                domAttr.get(domNode, "data-bind") );

            function getHostObjectChain () {
                var parents = query(domNode).parents("[data-context]").map(function(domNode){
                        var value = domAttr.get(domNode, "data-context");
                        return value || domAttr.get(domNode, "data-bind");
                    }),
                    chain   = [];

                var parent;
                while (parents.length){
                    parent = parents.shift();
                    if (parent.match(/^@/)){
                        chain.push(parent.slice(1));
                    } else {
                        chain.push(parent);
                        break;
                    }
                }

                return chain.reverse().join(".");
            }

            function getHostObject (propertyName, hostObject){
                var needParent = propertyName.match(/^@/);
                if(needParent){
                    return queryObject(hostObject, getHostObjectChain())
                } else {
                    return hostObject;
                }
            }

            function createObservation (step, reactionChain) {
                var propertyName = step.value.replace(/^@/, ""),
                    hostObject   = getHostObject(step.value, data)
                ;

                function handleContextUpdate (value){
                    if(domAttr.has(domNode, "data-context")){
                        var bindNodes = query("[data-bind]", domNode);
                        if (domAttr.has(domNode, "data-bind")){
                            bindNodes.unshift(domNode);
                        }
                        bindNodes.forEach(handleBindings);
                    }
                }

                function reaction (value) {
                    handleContextUpdate(value);
                    reactionChain(value);
//                    handleContextUpdate(value);
                }

                createObservableProperty(propertyName, hostObject, reaction);

                return queryObject(hostObject, propertyName);
            }

            function createReactionChain (steps) {
                return function (value) {

                    function func (value, step){
                        switch(step.type){
                            case "PROPERTY":
                                console.log(value + " -> " + step.value);
                                return value;
                            case "REACTION":
                                return reactions[step.value](value, {
                                    observer : domNode
                                });
                            default:
                                throw step.type + " is not implemented in reaction chain"
                        }
                    }

                    steps.reduce(func, value);
                };
            }

            function handleStatement (statement) {
                var firstStep     = statement.steps[0],
                    reactionChain = createReactionChain(statement.steps.slice(1)),
                    initialValue  = createObservation(firstStep, reactionChain)
                ;
                reactionChain(initialValue);
            }

            bindings.statements.forEach(handleStatement);

        }

        bindNodes.forEach(handleBindings);

    };

    return {

        _parseBindExpression : parseBindExpression,

        bindDomNode : function(domNode){

            return new DomNodeConnection(domNode);

        }


    };

});
