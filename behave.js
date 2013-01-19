define(["dojo/query", "dojo/dom-attr", "dojo/NodeList-traverse"], function(query, domAttr){

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
                console.log("ping get")
                return this[placeHolderName];
            },
            set : function(val){
                console.log("ping set")
                callback(val);
                this[placeHolderName] = val;
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

            var propertyPath, bindAttrValue = domAttr.get(domNode, "data-bind"),
                q            , //= context.split("."),
                propertyName , //= q.pop(),
                hostObject    //= q.length ? queryObject(data, q.join(".")) : data
            ;

            function getPropertyPath (str) {
                var needParent   = str.match(/^@/),
                    propertyName = str.replace(/^@/, ""),
                    pathParts,
                    path         = propertyName,
                    parents;

                if(needParent){
                    parents   = query(domNode).parents("[data-bind]"),
                    pathParts = parents.map(function(domNode){
                        return domAttr.get(domNode, "data-bind");
                    });

                    function buildPath (parts) {
                        var partName = parts.shift();

                        if(partName){
                            needParent = partName.match(/^@/);
                            partName   = partName.replace(/^@/, "");
                            path       = partName + "." + path;
                        }

                        if(needParent){
                            buildPath(parts);
                        }
                    }

                    buildPath(pathParts);
                }

                return path;
            }

            function getHostObject(){

            }

            function react (val) {
//                console.log("Ping, the value was " + val);
//                console.log("the node", domNode);
                var reaction = domAttr.get(domNode, "data-react");
                if(reaction === "render"){
                    domNode.innerHTML = val;
                }
            }

            propertyPath = getPropertyPath(bindAttrValue);
            q            = propertyPath.split(".");
            propertyName = q.pop();
            hostObject   = q.length ? queryObject(data, q.join(".")) : data;

            createObservableProperty(propertyName, hostObject, react);

        }

        bindNodes.forEach(handleBindings);

    };

//    DomNodeConnection.prototype.prepare = function(){
//
//        var bindNodes = query("[data-bind]", this.domNode);
//
//        if (domAttr.has(this.domNode, "data-bind")){
//            bindNodes.unshift(this.domNode);
//        }
//
//        function setQ (context){
//            return function(domNode){
//                var value    = domAttr.get(domNode, "data-q"),
//                    newValue = value.replace(/^@/, context + ".");
//
//                domAttr.set(domNode, "data-q", newValue);
//            }
//        }
//
//        function handleBindContext(domNode){
//            var context = domAttr.get(domNode, "data-bind");
//
//            query("[data-q]", domNode).forEach(
//                setQ(context)
//            );
//        }
//
//        bindNodes.forEach(handleBindContext);
//
//
//    }



    return {

        bindDomNode : function(domNode){

            return new DomNodeConnection(domNode);

        }


    };



//    var queryObject = function(obj, q){
//        return q.replace(/\[/g, ".[")
//            .split(".")
//            .reduce(function(val, key){
//                if(key.match(/^\[/)) {
//                    key = key.slice(1, key.length-1)
//                }
//                return val[key];
//            }, obj);
//    };
//
//    var prepare = function(domNode){
//
//        var bindNodes = query("[data-bind]", domNode);
//
//        if(domAttr.has(domNode, "data-bind")){
//            bindNodes.unshift(domNode);
//        }
//
//        bindNodes.forEach(function(node){
//
//            var context = domAttr.get(node, "data-bind");
//
//
//
//            query("[data-q]", node).forEach(function(node){
//
//                var value    = domAttr.get(node, "data-q"),
//                    newValue = value.replace(/^@/, context + ".");
//
//                domAttr.set(node, "data-q", newValue);
//
//            });
//
////            query("[data-each]", node).forEach(function(node){
////
////                var value    = domAttr.get(node, "data-each"),
////                    newValue = value.replace(/^@/, context + ".");
////
////                query("[data-q]", node).forEach(function(node){
////                    domAttr.set(node, "data-context", newValue);
////                });
////
////                domAttr.set(node, "data-each", newValue);
////
////            });
//
//        });
//
//    };
//
//    var makeObservable = function(propertyName, obj, callback){
//
//        var original        = obj[propertyName],
//            placeHolderName = "$observed$_" + propertyName;
//
//        Object.defineProperty(obj, propertyName, {
//            get : function(){
//                console.log("ping get")
//                return this[placeHolderName];
//            },
//            set : function(val){
//                console.log("ping set")
//                callback(val);
//                this[placeHolderName] = val;
//            }
//        });
//
//        obj[placeHolderName] = original;
//
//    };
//
//    var observe = function(domNode, data){
//        /*
//        var bindNodes = query("[data-bind]", domNode);
//
//        if(domAttr.has(domNode, "data-bind")){
//            bindNodes.unshift(domNode);
//        }
//
//        bindNodes.forEach(function(node){
//
//            var context      = domAttr.get(node, "data-bind"),
//                q            = context.split("."),
//                propertyName = q.pop(),
//                hostObject   = q.length ? queryObject(data, q.join(".")) : data
//                ;
//
//            makeObservable(propertyName, hostObject);
//
//        });
//        */
//
//        var qNodes = query("[data-q]", domNode);
//
//        if(domAttr.has(domNode, "data-q")){
//            qNodes.unshift(domNode);
//        }
//
//        qNodes.forEach(function(node){
//
//            var context      = domAttr.get(node, "data-q"),
//                q            = context.split("."),
//                propertyName = q.pop(),
//                hostObject   = q.length ? queryObject(data, q.join(".")) : data
//                ;
//
//            makeObservable(propertyName, hostObject, function(newVal){
//                node.innerHTML = newVal;
//            });
//
//        });
//
//    };
//
//    var bind = function(domNode, data){
//
//        var qNodes = query("[data-q]", domNode);
//
//        if(domAttr.has(domNode, "data-q")){
//            qNodes.unshift(domNode);
//        }
//
//        qNodes.forEach(function(node){
//
//            var q     = domAttr.get(node, "data-q"),
//                value = queryObject(data, q)
//            ;
//
//            node.innerHTML = value;
//
//        });
//
////        var eachNodes = query("[data-each]", domNode);
////
////        if(domAttr.has(domNode, "data-each")){
////            eachNodes.unshift(domNode);
////        }
////
////        eachNodes.forEach(function(node){
////
////            var q = domAttr.get(node, "data-each");
////
////            prepare(node);
////
////            bind(node, queryObject(data, q));
////
////        });
//    };
//
//    var release = function(data){
//
//    };
//
//    return {
//        prepare         : prepare,
//        bind            : bind,
//        observe         : observe,
//        release         : release
//    };

});
