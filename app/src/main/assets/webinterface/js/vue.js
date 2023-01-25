var experimentElement = {
    props: ['step', 'experimentState'],
    template: `<button v-if="step.index == experimentState.index && !experimentState.requiresUserInteraction" class="grid-item active" :title="step.value" @click="buttonClick(step.index)">{{step.friendlyName}}<br>{{step.shortValue}}</button><button v-else-if="step.index == experimentState.index" class="grid-item stopped" :title="step.value" @click="buttonClick(step.index)">{{step.friendlyName}}<br>{{step.shortValue}}</button><button v-else class="grid-item" :title="step.value" @click="buttonClick(step.index)">{{step.friendlyName}}<br>{{step.shortValue}}</button>`,
    methods: {
        buttonClick: (index) => {
            vm.jumpButtonClick(index);
        }
    },
    components: {
        "vm": vm
    }
}

var decisionElement = {
    props: ['element'],
    template: `<button class="grid-item" :title="element.value" @click="buttonClick(element.index)">{{element.friendlyName}}<br>{{element.shortValue}}</button>`,
    methods: {
        buttonClick: (index) => {
            vm.decisionButtonClick(index);
        }
    },
    components: {
        "vm": vm
    }
}

var noConnection = {
    template: '<button class="noconnection" @click="reconnect">Unable to establish connection. Click to reconnect.</button>',
    methods: {
        reconnect: () => {
            vm.reconnect();
        }
    },
    components: {
        "vm": vm
    }
}

var state = {
    props: ['steps', 'experimentState', 'currentState'],
    template: '<div v-if="currentState == 0" class="one-element-container"><button class="start-experiment" @click="startExperiment">Experiment has not started yet. Click to start.</button></div><div v-else-if="currentState == 1" class="grid-container"><experiment-element v-for="step in steps" v-bind:step="step" v-bind:experiment-state="experimentState"></experiment-element></div><div v-else-if="currentState == 2" class="grid-container"><decision-element v-for="element in steps[experimentState.index].possibilities" v-bind:element="element"></decision-element></div>',
    methods: {
        startExperiment: () => {
            vm.startExperiment();
        }
    },
    components: {
        "experiment-element": experimentElement,
        "decision-element": decisionElement,
        "vm": vm
    }
}

var parent = {
    props: ['connection', 'steps', 'experimentState', 'currentState'],
    template: '<div v-if="connection"><state v-bind:steps="steps" v-bind:experiment-state="experimentState" v-bind:current-state="currentState"></state></div><div v-else class="one-element-container"><no-connection></no-connection></div>',
    components: {
        "state": state,
        "no-connection": noConnection
    }
}

var vm = new Vue({
  el: '#app',
  data: {
    experimentState: {
        index: null,
        stopped: false
    },
    currentState: 0,
    experiment: null,
    response: null,
    connection: null,
    steps: []
  },
  methods: {
    loadExperiment: async function() {
        var dataResponse = await fetch("/data");
        var stateResponse = await fetch("/currentstate");
        this.response = await dataResponse.json();
        this.currentState = await stateResponse.json();
        var experimentSteps = this.response.sequence.order.split(',');
        var i = 0;
        this.steps = [];
        for (step of experimentSteps) {
            var value = this.response.sequence[step].value
            var shortValue = ""
            if (typeof value == "object") {
                var newValue = ""
                for (key in value) {
                    newValue += (key + ": " + value[key] + " ");
                }
                value = newValue
            }
            shortValue = value;
            var possibilities = [];
            var possibilitiesJson = this.response.sequence[step].possibilities;
            if (possibilitiesJson) {
                possibleSteps = possibilitiesJson.order.split(",");
                var j = 0;
                for (possibleStep of possibleSteps) {
                    var possibilityValue = possibilitiesJson[possibleStep].value
                    var shortPossibilityValue = ""
                    if (typeof possibilityValue == "object") {
                        var newPossibilityValue = ""
                        for (key in possibilityValue) {
                            newPossibilityValue += (key + ": " + possibilityValue[key] + " ");
                        }
                        possibilityValue = newPossibilityValue
                    }
                    shortPossibilityValue = possibilityValue;
                    newPossibility = {index: j, item: possibleStep, friendlyName: possibilitiesJson[possibleStep].friendly_name, value: possibilityValue, shortValue: shortPossibilityValue}
                    possibilities.push(newPossibility)
                }
            }
            newStep = {index: i, item: step, friendlyName: this.response.sequence[step].friendly_name, value: value, shortValue: shortValue, possibilities: possibilities};
            this.steps.push(newStep);
            i++;
        }
        console.log(this.steps);
    },
    init: function() {
        this.connection = new WebSocket("ws://" + location.host + "/websocket");

        this.connection.onmessage = (event) => {
            console.log(event);
            if (event.data.startsWith("new-state")) {
                this.currentState = event.data.split(" ")[1];
            } else {
                this.experimentState = JSON.parse(event.data);
            }
        };
        this.connection.onopen = (event) => {
            console.log("Connected.");
        };
        this.connection.onclose = (event) => {
            console.log(event);
            this.connection = null;
        };
        this.connection.onerror = (event) => {
            console.log(event);
            this.connection = null;
        };
    },
    reconnect: () => {
        vm.loadExperiment();
        vm.init();
    },
    jumpButtonClick(index) {
        this.connection.send("{\"type\": jumpto, \"value\": " + index + "}");
    },
    decisionButtonClick(index) {
        this.connection.send("{\"type\": decision, \"value\": " + index + "}");
    },
    startExperiment() {
        this.connection.send("{\"type\": start}");
    }
  },
  mounted: function() {
    this.loadExperiment();
    this.init();
  },
  components: {
    "experiment-element": experimentElement,
    "decision-element": decisionElement,
    "parent": parent,
    "no-connection": noConnection,
    "state": state
  }
});
