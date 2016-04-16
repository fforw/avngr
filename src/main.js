var React = require("react");
var ReactDOM = require("react-dom");

var domready = require("domready");

var Test = React.createClass({
    render: function ()
    {
        return ( <div>Test</div> );
    }
});

domready(function ()
{
    ReactDOM.render(<Test/>, document.getElementById("root"), function ()
    {
        console.info("done");
    });

});

