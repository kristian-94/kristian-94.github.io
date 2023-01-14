---
title: 'Machine Learning'
draft: false
hero: micrograd_hero.svg
---

These are my notes taken during implementing the micrograd library and training a neural net to recognise images.

Check back soon for a link to a working demo and code :)

## What is micrograd?

This is all based off [Andrej Karpathy](https://en.wikipedia.org/wiki/Andrej_Karpathy)'s Github repo and Youtube videos.
I am a huge fan of him!

Micrograd is all you need to train neural networks. Everything else (pytorch/tensor flow) is just efficiency.

{{< rawhtml >}}
<div class="text-center">
<div class="github-card" data-github="karpathy/micrograd" data-width="400" data-height="" data-theme="default"></div>
<script src="//cdn.jsdelivr.net/github-cards/latest/widget.js"></script>
<br>
</div>
{{< /rawhtml >}}

{{< youtube VMj-3S1tku0 >}}

# My notes

We need to get the gradient of the loss function and step towards minimal value. Change weights of inputs in a way that
will take us there.

Two files:
`nn.py` neural net library importing and using micrograd engine.
`engine.py` 100 lines of python code, no imports.

### nn.py

`neuron` : one link in the chain of weights, ends up getting a value and connected to other neurons. The weight between
is the strength of that connection.
`layer` layer of neurons. They are all connected to the input but not eachother, a set of neurons evaluated
independently.
`MLP` multi layer perceptron: sequence of layers of neurons.

We are computing the derivative of the loss function with respect to the weights of the neural network.

##### How do weights affect the loss function?

Use gradient information. Weights are leaf nodes, they are an input. The other leaf nodes are the data but that is
fixed.

### Gradient calculation

In calculus, we can use the product rule to explicitly generate an equation to get the exact derivative.
However, we can't do that for these huge functions with 10k parameters and we don't need to.

#### What is a gradient?

A gradient is the slope of a graph at a point. We get this as a limit when increasing x by a small amount. Practically,
this means we just
need to insert a slightly larger number and rerun our function. Then we see how much it changed, positive or negative,
that's the gradient.

We normalise by dividing by the height, rise/run. `(L2 - L1)/h `
We can get the gradient of the final L loss with respect to any of the input elements, by only changing it, and then
seeing how much L changed. This is the way to verify the calculated overall gradient that is found by traversing each
node individually and applying the chain rule from the surrounding nodes.

If we know how much d affects L, and how much e affects d, we can then use the chain rule of derivatives to calculate
the overall derivative of e on L.

A `+` in the chart just pulls through the next node's gradient. A plus has a gradient of 1.0 with respect to the next
node, so it can just copy the next gradient to the children nodes. It's basically equivalent of a simple equation
eg. `y = x + c` -> gradient is 1.

#### Back propagation

This is a recursive application of the chain rule back through the computational graph.

### Leaf Nodes

Some inputs are static data. The others are weights. Some others can be bias.

For each neuron:

- Take all the inputs and sum all the weights and values. (can have any number of inputs)
- Add the bias.
- Take it through an activation function (tanh/sigmoid). This squashes the input into a value between 0 - 1 which is the
  final output and value of this neuron.

We want the local derivative of the neuron's inputs on the final output. This whole thing is one little neuron in the
neural net. In the end we'll back propagate through the entire set of neurons for the overall loss function. We really
want the neurons output derived from the weights which is the thing we can change.




