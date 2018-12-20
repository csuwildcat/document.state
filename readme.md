# `document.state`

An experimental bit of code that enables encapsulation of CSS styles in declarative at-rule `state` blocks that can be dynamically activated/deactivated.

## Usage

## Declaring a CSS State Block

States are declaratively defined by adding a specially formed `@supports` rule to any same-domain stylesheet or inline `<style>` tag. This is what it looks like to declare a `state` block:

```css
@supports (state: foo) {
  body {
    background: red;
  }
}

@supports (state: bar) {
  body {
    background: green;
  }
}
```

## Activating a State

Activating a state is rather simple, you just call the `document.state.activate()` method with whatever state you wish to activate:

```javascript
document.state.activate('foo');
```

You can have multiple states active at once, and if you want to know which states are active at any time, just use the getter `var activeStates = document.states.active`, which returns an array with the names of all active states. 

When a state is activated, the styles in the state block are applied at the same position as the `@supports` block they are declared in, meaning they follow the natural positional application and subsequent cascade as any other style block would.

## Deactivating a State

Just like activating a state, call `document.state.deactivate()` with whatever state you want to deactivate:

```javascript
document.state.deactivate('foo');
```

## Running the Test Page

Because state blocks can only be declared in same-origin and inline style tags, you'll need to go snag the npm `serve` package to serve the index.html test page. You can add `serve` globally by running `npm install serve -g`, then simply run `serve` at the command line while inside the repo directory.

## How it Works

The trick behind the scenes is that the CSS parser will retain `@supports` rules even if the condition it parses is unknown to it. The `document.state` code includes hooks that detect new `state` blocks in all stylesheet/style elements and those added dynamically (via methods like `CSSStyleSheet.insertRule()`).

When new state blocks are detected, the logic generates a valid `@media all {}` block with all the rules declared within the state block and caches it.

Then, upon activation of a state, the code inserts a rule just after the index of the originally declared state block, which immediately applies the containing rules in the position and cascade order you would expect.

> NOTE: if a state block is declared and its state is already active, the rules are immediately applied.