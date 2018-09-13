(function() {
  const state = {
    selects: []
  };

  const SELECTED_CLASS = "selected";
  const OPTIONS_CONTAINER_CLASS = "options";

  const compose = (x, f) => f(x);
  const pick = (obj, fields) =>
    fields.reduce((agg, field) => Object.assign({}, agg, { [field]: obj[field] }), {});

  const addClass = className => el => {
    el.setAttribute("class", className);
    return el;
  };

  const setSrc = src => el => {
    el.src = src;
    return el;
  };

  const buildSelected = (updateState, container) => {
    const selected = document.createElement("div");
    selected.setAttribute("class", SELECTED_CLASS);
    selected.addEventListener("click", e => {
      updateState(select => Object.assign({}, select, { open: !select.open }));
      e.stopPropagation();
    });
    container.appendChild(selected);
  };

  const makeSelectedContent = (open, label) => {
    const labelEl = [setInnerHTML(label), addClass("label")].reduce(
      compose,
      document.createElement("div")
    );

    const src = `public/chevron-${open ? "up" : "down"}.svg`;
    const chevron = [setSrc(src), addClass("chevron")].reduce(
      compose,
      document.createElement("img")
    );

    return [labelEl, chevron];
  };

  const buildOptionsContainer = container => {
    const optionsContainer = document.createElement("div");
    optionsContainer.setAttribute("class", OPTIONS_CONTAINER_CLASS);
    container.appendChild(optionsContainer);
  };

  const buildOptions = (updateState, options) =>
    options.map(({ label, value }) => {
      const option = [setInnerHTML(label), addClass("option")].reduce(
        compose,
        document.createElement("div")
      );
      option.addEventListener("click", () => {
        updateState(select => Object.assign({}, select, { value, open: false }));
        render();
      });
      return option;
    });

  const getSelected = el => el.getElementsByClassName(SELECTED_CLASS)[0];
  const getOptionsContainer = el => el.getElementsByClassName(OPTIONS_CONTAINER_CLASS)[0];

  const setInnerHTML = value => el => {
    el.innerHTML = value;
    return el;
  };

  const replaceChildren = children => container => {
    container.innerHTML = "";
    children.forEach(child => container.appendChild(child));
    return container;
  };

  const makeStateUpdater = i => fn => {
    state.selects[i] = fn(state.selects[i]);
    render();
  };

  const selectContainers = [...document.getElementsByClassName("select-container")];

  function construct() {
    selectContainers.forEach((container, i) => {
      const selectEl = container.getElementsByTagName("select")[0];
      const { value, options } = selectEl;
      state.selects.push({
        selectEl,
        value,
        open: false,
        options: [...options].map(option => pick(option, ["label", "value"]))
      });

      buildSelected(makeStateUpdater(i), container);
      buildOptionsContainer(container);
    });

    document.addEventListener("click", () => {
      selectContainers
        .map((_, i) => makeStateUpdater(i))
        .forEach(updateState => updateState(select => Object.assign({}, select, { open: false })));
    });

    render();
  }

  function render() {
    selectContainers.forEach((container, i) => {
      const { selectEl, value, open, options } = state.selects[i];
      const { label } = options.find(option => option.value === value);

      // Update real select's value
      selectEl.value = value;

      // Update fake select's displayed value
      [getSelected, replaceChildren(makeSelectedContent(open, label))].reduce(compose, container);

      // Update fake select's options
      const updateState = makeStateUpdater(i);
      const optionEls = open ? buildOptions(updateState, options) : [];
      [getOptionsContainer, replaceChildren(optionEls)].reduce(compose, container);
    });
  }

  construct();
})();
