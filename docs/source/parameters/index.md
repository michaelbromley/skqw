---
title: "Developer Guide: Parameters"
date: 2016-08-26 08:57:33
---

It is possible to make certain aspects of a visualization configurable at run-time by the user. To do this we need to use parameters.

Here's an example:

```JavaScript
let params = {
    hue: {
        value: 120,
        type: 'range',
        label: 'Hue',
        min: 0,
        max: 360
    }
};

// ... init() function omitted

function tick() {
    // ... code omitted
    ctx.fillStyle = `hsl(${params.hue.value}, 50%, 50%)`;
    // draw some stuff with the given hue.
}

function paramChange(change) {
    // this is optional, see explanation below
    params[change.paramKey].value = change.newValue;
}

module.exports = {
    name: 'Params Example',
    init,
    tick,
    paramChange,
    params
};
```

Let's walk through each of the new concepts introduced here:

#### `params` object
The `params` object is where we define our user-configurable parameters. Each object will be represented by a UI control in the settings panel of the SKQW user interface. In this example, we want to enable the user to set the hue (colour) of some element in our visualization.
 
The `value`, `type`, and `label` properties are required:

- `value` is the actual value of the parameter.
- `type` determines the type of UI control that will be rendered to control this param. Currently only "range" and "boolean" are supported, which will render a slider or a checkbox respectively.
- `label` is the label associated with the control in the UI. This is what the user sees.

Additionally, with a "range" type, we may also specify optional `min`, `max`, and `step` properties which control the behaviour of the slider control.

#### `paramChange()` function (optional)
This function is called every time the user changes the value of a param in the UI. The second argument is an object consisting of two properties:

- `paramKey` is the key of the param that was changed. In this case it would be "hue". 
- `newValue` is the new value assigned by the user.

In fact, this function is optional. If it is omitted, SKQW will automatically apply the same function as shown above to update the parameter values. It is only necessary to define this function if additional processing is required when a parameter changes.

Finally, we need to ensure we export `params` and `paramChange` so that SKQW knows about them.
