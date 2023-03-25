var experiments = {
    props: ['experiment'],
    template: '<button class="grid-item" @click="buttonClick(experiment)">{{experiment}}</button>',
    methods: {
        buttonClick: (experiment) => {
            vm.experimentButtonClick(experiment);
        }
    },
    components: {
        "vm": vm
    }
}

var experimentEditor = {
    props: ['block', 'currentExperiment'],
    template: `<button v-if="block !== '+' && block !== 'Exit'" class="grid-item" @click="buttonClick(block)" :title="currentExperiment.experiment.sequence[block].value">{{currentExperiment.experiment.sequence[block].friendly_name}}</button><button v-else class="grid-item" @click="buttonClick(block)">{{block}}</button>`,
    methods: {
        buttonClick: (block) => {
            vm.editButtonClick(block);
        }
    },
    components: {
        "vm": vm
    }
}

var noInput = {
    template: '<div></div>'
}

var textInput = {
    props: ['currentBlock'],
    template: '<input type="text" class="text" v-model="currentBlock.value">'
}

var numberInput = {
    props: ['currentBlock'],
    template: '<input type="number" class="number" v-model="currentBlock.value">'
}

var coordinateInput = {
    props: ['currentBlock'],
    template: '<div><input type="number" class="number" v-model="currentBlock.value.x"><input type="number" class="number" v-model="currentBlock.value.y"><input type="number" class="number" v-model="currentBlock.value.z"></div>'
}

var fileInput = {
    props: ['currentBlock'],
    template: '<div></div>'
}

var newExperiment = {
    data: function() {
        return {
            newName: ""
        }
    },
    template: '<div class="two-element-container"><div><label for="new-experiment-name">Experiment name</label><br><input type="text" id="new-experiment-name" v-model="newName"></div><div></div><button class="grid-item" @click="createButtonClick(newName)">Create Experiment</button><button class="grid-item" @click="exitButtonClick">Cancel</button></div>',
    methods: {
        createButtonClick: (name) => {
            vm.createExperiment(name);
        },
        exitButtonClick: () => {
            vm.state = 0;
        }
    },
    components: {
        "vm": vm
    }
}

var blockEditor = {
    props: ['currentBlock'],
    template: `<div class="two-element-container"><div><label for="block-type-select">Block type</label><br><select class="select" id="block-type-select" v-model="currentBlock.friendly_name"><option value="Animation">Animation</option><option value="Display">Display</option><option value="Reset Display">Reset Display</option><option value="Look At Target">Look At Target</option><option value="Reset Look At">Reset Look At</option><option value="Move To">Move To</option><option value="Say">Say</option><option value="Sound">Sound</option><option value="Time">Time</option><option value="Empty">Empty</option></select></div><div><label for="input">Value</label><br><no-input v-if="currentBlock.friendly_name == 'Reset Display' || currentBlock.friendly_name == 'Reset Look At'" id="input"></no-input><text-input v-else-if="currentBlock.friendly_name == 'Say' || currentBlock.friendly_name == 'Empty'" id="input" v-bind:current-block="currentBlock"></text-input><number-input v-else-if="currentBlock.friendly_name == 'Time'" id="input" v-bind:current-block="currentBlock"></number-input><coordinate-input v-else-if="currentBlock.friendly_name == 'Look At Target' || currentBlock.friendly_name == 'Move To'" id="input" v-bind:current-block="currentBlock"></coordinate-input><file-input v-else-if="currentBlock.friendly_name == 'Animation' || currentBlock.friendly_name == 'Display' || currentBlock.friendly_name == 'Sound'" id="input" v-bind:current-block="currentBlock"></file-input></div><div><label for="stopping-checkbox">Stopping</label><br><input type="checkbox" id="stopping-checkbox" class="checkbox" v-model="currentBlock.stopping"></div><div><label for="interaction-checkbox">Requires user interaction</label><br><input type="checkbox" class="checkbox" v-model="currentBlock.requires_user_interaction"></div><button v-if="currentBlock.requires_user_interaction && !(typeof possibility === 'string')" v-for="possibility in currentBlock.possibilities" class="grid-item" @click="editPossibility(possibility)">{{possibility.friendly_name}}</button><button v-if="currentBlock.requires_user_interaction" class="grid-item" @click="addPossibility">+</button><button class="grid-item" @click="exitButtonClick">Exit</button></div>`,
    methods: {
        exitButtonClick: () => {
            if (vm.currentBlock.friendly_name == null) {
                vm.currentBlock.friendly_name = "Empty";
            }
            vm.returnFromBlockEditor();
        },
        addPossibility: () => {
            vm.setBlockName();
            vm.currentPossibility = {
                name: null,
                friendly_name: null,
                value: null,
                stopping: true,
                jump: {
                    enabled: false,
                    target: "",
                    again: false
                }
            }
            vm.state = 4;
        },
        editPossibility: (possibility) => {
            vm.currentPossibility = possibility;
            if (vm.currentPossibility.jump != "") {
                vm.currentPossibility.jump = {
                    enabled: true,
                    target: vm.currentPossibility.jump.split(",")[0],
                    again: Boolean(vm.currentPossibility.jump.split(",")[1])
                };
            } else {
                vm.currentPossibility.jump = {
                    enabled: false,
                    target: "",
                    again: false
                };
            }

            vm.state = 4;
        }
    },
    components: {
        "no-input": noInput,
        "text-input": textInput,
        "number-input": numberInput,
        "coordinate-input": coordinateInput,
        "file-input": fileInput,
        "vm": vm
    }
}

var possibilityEditor = {
    props: ['currentPossibility', 'currentExperiment'],
    template: `<div class="two-element-container"><div><label for="block-type-select">Possibility type</label><br><select class="select" id="block-type-select" v-model="currentPossibility.friendly_name"><option value="Animation">Animation</option><option value="Display">Display</option><option value="Reset Display">Reset Display</option><option value="Look At Target">Look At Target</option><option value="Reset Look At">Reset Look At</option><option value="Move To">Move To</option><option value="Say">Say</option><option value="Sound">Sound</option><option value="Time">Time</option><option value="Empty">Empty</option></select></div><div><label for="input">Value</label><br><no-input v-if="currentPossibility.friendly_name == 'Reset Display' || currentPossibility.friendly_name == 'Reset Look At'" id="input"></no-input><text-input v-else-if="currentPossibility.friendly_name == 'Say' || currentPossibility.friendly_name == 'Empty'" id="input" v-bind:current-block="currentPossibility"></text-input><number-input v-else-if="currentPossibility.friendly_name == 'Time'" id="input" v-bind:current-block="currentPossibility"></number-input><coordinate-input v-else-if="currentPossibility.friendly_name == 'Look At Target' || currentPossibility.friendly_name == 'Move To'" id="input" v-bind:current-block="currentPossibility"></coordinate-input><file-input v-else-if="currentPossibility.friendly_name == 'Animation' || currentPossibility.friendly_name == 'Display' || currentPossibility.friendly_name == 'Sound'" id="input" v-bind:current-block="currentPossibility"></file-input></div><div><label for="stopping-checkbox">Stopping</label><br><input type="checkbox" id="stopping-checkbox" class="checkbox" v-model="currentPossibility.stopping"></div><div><label for="jump-checkbox">Jump after decision</label><br><input type="checkbox" id="jump-checkbox" v-model="currentPossibility.jump.enabled"></div><div v-if="currentPossibility.jump.enabled"><label for="target-block">Target block</label><select id="target-block" class="select" v-model="currentPossibility.jump.target"><option v-for="block in currentExperiment.order" v-if="block !== '+' && block !== 'Exit'" :value="block">{{currentExperiment.experiment.sequence[block].friendly_name}}: {{currentExperiment.experiment.sequence[block].value}}</option></select></div><div v-if="currentPossibility.jump.enabled"><label for="again-checkbox">Execute block again</label><br><input id="again-checkbox" type="checkbox" class="checkbox" v-model="currentPossibility.jump.again"></div><button class="grid-item" @click="exitButtonClick">Exit</button></div>`,
    methods: {
        exitButtonClick: () => {
            if (!vm.currentPossibility.jump.enabled || vm.currentPossibility.jump.target == "") {
                vm.currentPossibility.jump = "";
            } else {
                if (vm.currentPossibility.jump.again) {
                    vm.currentPossibility.jump = vm.currentPossibility.jump.target + ",1";
                } else {
                    vm.currentPossibility.jump = vm.currentPossibility.jump.target + ",0";
                }
            }
            if (vm.currentPossibility.friendly_name == null) {
                vm.currentPossibility.friendly_name = "Empty";
            }
            vm.returnFromPossibilityEditor();
        }
    },
    components: {
        "no-input": noInput,
        "text-input": textInput,
        "number-input": numberInput,
        "coordinate-input": coordinateInput,
        "file-input": fileInput,
        "vm": vm
    }
}

var state = {
    props: ['state', 'experiments', 'currentExperiment', 'currentBlock', 'currentPossibility'],
    template: '<div v-if="state == 0" class="grid-container"><experiments v-for="experiment in experiments" v-bind:experiment="experiment"></experiments></div><div v-else-if="state == 1" class="grid-container"><experiment-editor v-for="block in currentExperiment.order" v-bind:current-experiment="currentExperiment" v-bind:block="block"></experiment-editor></div><new-experiment v-else-if="state == 2"></new-experiment><block-editor v-else-if="state == 3" v-bind:current-block="currentBlock"></block-editor><possibility-editor v-else-if="state == 4" v-bind:current-possibility="currentPossibility" v-bind:current-experiment="currentExperiment"></possibility-editor>',
    components: {
        "experiments": experiments,
        "new-experiment": newExperiment,
        "experiment-editor": experimentEditor,
        "block-editor": blockEditor,
        "possibility-editor": possibilityEditor
    }
}

var vm = new Vue({
  el: '#app',
  data: {
    experiments: [],
    currentExperiment: {
        name: null,
        order: null,
        experiment: null
    },
    currentBlock: {
        name: null,
        friendly_name: null,
        value: null,
        stopping: true,
        requires_user_interaction: false,
        possibilities: {
            order: ""
        }
    },
    currentPossibility: {
        name: null,
        friendly_name: null,
        value: null,
        stopping: true,
        jump: ""
    },
    state: 0
  },
  methods: {
    loadExperiments: async function() {
        var dataResponse = await fetch("/experiments");
        dataResponse = await dataResponse.text();
        this.experiments = dataResponse.split(",");
        this.experiments.push("+");
    },
    experimentButtonClick: async function(experiment) {
        if (experiment != "+") {
            var dataResponse = await fetch("/experiment?name=" + experiment);
            dataResponse = await dataResponse.json();
            this.currentExperiment.name = experiment;
            this.currentExperiment.experiment = dataResponse;
            this.currentExperiment.order = dataResponse.sequence.order.split(",");
            this.currentExperiment.order.push("+");
            this.currentExperiment.order.push("Exit");
            this.state = 1;
        } else {
            this.state = 2;
        }
    },
    returnFromBlockEditor: function() {
        this.setBlockName();
        this.state = 1;
    },
    setBlockName: function() {
        var name = this.getBlockName(this.currentBlock.friendly_name, this.currentExperiment.order);
        if (this.currentBlock.name == null) {
            this.currentBlock.name = name;
            this.currentExperiment.experiment.sequence[name] = this.currentBlock;
            if (this.currentExperiment.experiment.sequence.order == "") {
                this.currentExperiment.experiment.sequence.order = name;
            } else {
                this.currentExperiment.experiment.sequence.order = this.currentExperiment.experiment.sequence.order + "," + name;
            }
            this.currentExperiment.order.splice(this.currentExperiment.order.length - 2, 0, name);
        } else {
            if (this.currentBlock.name.substring(0, this.currentBlock.name.lastIndexOf('_')) != name.substring(0, name.lastIndexOf('_'))) {
                delete this.currentExperiment.experiment.sequence[this.currentBlock.name];
                this.currentExperiment.experiment.sequence.order = this.currentExperiment.experiment.sequence.order.replace(this.currentBlock.name, name);
                this.currentExperiment.order[this.currentExperiment.order.indexOf(this.currentBlock.name)] = name;
                this.currentBlock.name = name;
                this.currentExperiment.experiment.sequence[name] = this.currentBlock;
            } else {
                this.currentExperiment.experiment.sequence[this.currentBlock.name] = this.currentBlock;
            }
        }
    },
    returnFromPossibilityEditor: function() {
        this.setBlockName();
        var name = this.getBlockName(this.currentPossibility.friendly_name, this.currentBlock.possibilities.order);
        if (this.currentPossibility.name == null) {
            this.currentPossibility.name = name;
            this.currentBlock.possibilities[name] = this.currentPossibility;
            if (this.currentBlock.possibilities.order == "") {
                this.currentBlock.possibilities.order = name;
            } else {
                this.currentBlock.possibilities.order = this.currentBlock.possibilities.order + "," + name;
            }
        } else {
            if (this.currentBlock.name.substring(0, this.currentBlock.name.lastIndexOf('_')) != name.substring(0, name.lastIndexOf('_'))) {
                delete this.currentBlock.possibilities[this.currentPossibility.name];
                this.currentBlock.possibilities.order = this.currentBlock.possibilities.order.replace(this.currentPossibility.name, name);
                this.currentPossibility.name = name;
                this.currentBlock.possibilities[name] = this.currentPossibility;
            } else {
                this.currentBlock.possibilities[this.currentPossibility.name] = this.currentPossibility;
            }
        }
        this.state = 3;
    },
    editButtonClick: async function(block) {
        if (block != "+" && block != "Exit") {
            this.currentBlock = this.currentExperiment.experiment.sequence[block];
            this.currentBlock.name = block;
            this.state = 3;
        } else if (block == "+") {
            this.currentBlock = {
                name: null,
                friendly_name: null,
                value: null,
                stopping: true,
                requires_user_interaction: false,
                possibilities: {
                    order: ""
                }
            };
            this.state = 3;
        } else if (block == "Exit") {
            var dataResponse = await fetch("/experiment?name=" + this.currentExperiment.name, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.currentExperiment.experiment)
            });
            this.state = 0;
        }
    },
    createExperiment: async function(name) {
        var dataResponse = await fetch("/experiment?name=" + name + ".json", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify("")
        });
        dataResponse = await dataResponse.text();
        this.experiments = dataResponse.split(",");
        this.experiments.push("+");
        this.state = 0;
    },
    getBlockName: function(friendly_name, order) {
        var name = "";
        switch(friendly_name) {
            case "Animation":
            name = "animation_";
            break;
            case "Display":
            name = "display_";
            break;
            case "Reset Display":
            name = "reset_display_";
            break;
            case "Look At Target":
            name = "look_at_";
            break;
            case "Reset Look At":
            name = "reset_look_";
            break;
            case "Move To":
            name = "move_to_";
            break;
            case "Say":
            name = "say_";
            break;
            case "Sound":
            name = "sound_";
            break;
            case "Time":
            name = "time_";
            break;
            case "Empty":
            name = "empty_";
            break;
            default:
            name = "empty_";
        };
        var counter = 0;
        for (block of order) {
            if (block.startsWith(name)) {
                counter++;
            }
        }
        return name + counter;
    }
  },
  mounted: function() {
    this.loadExperiments();
  },
  components: {
    "state": state
  }
});
