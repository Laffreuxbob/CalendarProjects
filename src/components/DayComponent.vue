<template>
    <div class="day" :class="unDroppable()" :id="today()">
        <!-- <div v-for="t in dayTasks" :key="t.id">{{t.label}}{{t.startDate.format('HH:mm')}}{{t.duration}}
         </div>-->
        <div class="day-name" v-if="testWeek()">
            <div class="string-day">{{getUpperCase('dddd')}}</div>
            <div class="number-day">{{mainDay.locale('fr').format('DD')}}</div>
            <div class="month-day"> {{getUpperCase('MMMM')}}</div>
        </div>

        <div class="weekend-name" v-else>{{mainDay.locale('fr').format('dddd')[0].toUpperCase()}}</div>
        <hr>
        <div v-for="(h,index) in hours"
             v-if="testWeek()"
             class="day-time"
             :key="h.date.format('HH:mm')"
             @dragover="(e)=>{e.preventDefault()}"
             @drop="handleDrop(h.date, $event)">

            <div class="taskIn"
                 :class="getDelai(t.dueDate, t.startDate.locale('fr').format('YYYY-MM-DD'))"
                 :style="setStyle(t)"
                 v-on:dblclick="fullsize(t)"
                 @dragstart="startDrag(t, $event)"
                 draggable="true"
                 v-for="t in dayTasks"
                 :key="t.id"
                 v-if=" h.date.format('HH:mm') === t.startDate.format('HH:mm')">

                <div class="data-taskIn">
                    <div class="name-taskIn">{{t.label}} -{{getSlotTime(t,"end")}}</div>
                    <div class="range-taskIn"> {{t.duration}}</div>
                </div>

                <div class="resizer" @mousedown="initResize(t, $event)">
                </div>

            </div>
            <p class="nameHour">{{h.date.format('HH:mm')}}</p>

        </div>
    </div>
</template>

<script>
    import moment from 'moment'
    import data from '../fake-tasks'

    const startHour = 8;  // Debut de journee
    const endHour = 18;   // Fin de journee
    const unitTime = .5;  // Unité de temps de base : .5 = 30 min
    export default {
        name: 'Day',
        props: {
            mainDay: {required: false, type: Object, default: () => moment()},
            tasks: {required: false, type: Array, default: () => ([])},
        },
        data() {
            return {
                hours: [],
                projects: data.projects,
                // Data de transfert pour le resize
                trancheHoraireResize: [],
                actualTask: null,
                actualDiv: null,
                durationInit: 0,
            }
        },
        computed: {
            test(e) {  // Debug Function
                console.log("test");
                console.log(e);
                console.log("test");
            },

            dayTasks: function () {
                const startDay = this.mainDay.clone().startOf('day');
                const endDay = this.mainDay.clone().endOf('day');
                const tasks = this.$props.tasks.filter((t) => {
                    return t.startDate && t.startDate.isAfter(startDay) && t.startDate.isBefore(endDay)
                });
                tasks.map((t) => {
                    t.project = this.projects.find((p) => p.id === t.project_id);
                });
                return tasks
            },

            // Maintenir la height graphiquement au drag n drop calendar /!\ en construction

        },
        methods: {
            //________________________BOB________________________
            // Garde la nouvelle height en fonction de la charge allouée
            setStyle: function (task) {
                return {
                    height: 2.4 * task.duration * 2 + "rem"
                }
            },

            fullsize(task) {  // Au double-clic, la tache remplit le reste de la journee
                let start = task.startDate;
                let end = task.startDate.clone().add(task.duration, 'hours');
                console.log(start._d);
                console.log(end._d);
                console.log(task.duration);
                let endDay = start.clone().set({
                    'hour': endHour,
                    'minute': 0,
                });
                let i = unitTime;
                /*console.log(moment(start));console.log(moment(end));console.log(moment(endDay));*/
                while (end.diff(endDay) !== 0) { // il en reste ds le panier
                    end.add(unitTime, 'hours');
                    i += unitTime;
                }
                task.duration = i;
            },

            initResize(task, event) {
                console.log("-----------------------");
                console.log("Start resize");
                console.log("-----------------------");

                this.actualDiv = event.path[1]; // On recupere le projet "graphique"
                this.actualDiv.draggable = false; // Il est resizable et plus draggable
                this.actualDiv.style.zIndex = 10;

                // Ajout des evenements necessaire au resize
                window.addEventListener('mousemove', this.resize, false);
                window.addEventListener('mouseup', this.stopResize, false);

                // Init des data
                this.trancheHoraireResize = [task.startDate.format('HH:mm')];
                this.actualTask = task;
                this.durationInit = this.actualTask.duration;
            },

            resize(e) {
                let divH = e.path[1];
                divH.style.zIndex = 0;
                let i = this.trancheHoraireResize.length;
                let startSlot = (this.getSlotTime(this.actualTask, "start"));
                if (divH) {
                    let texte = divH.innerText; // On recupere l'heure en str
                    // On passe nos str en moment()
                    let currentSlot = (moment(texte)._i);
                    console.log("-----------------------");
                    console.log("startSlot", startSlot);
                    console.log("currentSlot", currentSlot);
                    console.log("-----------------------");

                    let currentHour = parseInt(currentSlot.substring(0, 2));
                    let startHour = parseInt(startSlot.substring(0, 2));
                    let currentMin = parseInt(currentSlot.substring(3, 5));
                    let startMin = parseInt(startSlot.substring(3, 5));

                    // On teste le resize vers le haut
                    let negativ = this.negativResize(currentHour, currentMin, startHour, startMin);
                    // Si on est sur la tache, on reinitialise le resize
                    if (divH.className === "taskIn" || divH.className === "data-taskIn" || divH.className === "name-taskIn") {
                        this.trancheHoraireResize = [this.trancheHoraireResize[0]];
                        this.actualTask.duration = this.durationInit;
                    } else if (divH.className === "day-time" && negativ) {
                        // Si tranche != alors on l'ajoute
                        if (texte !== this.trancheHoraireResize[i - 1]
                            && texte !== this.trancheHoraireResize[i - 2]) {
                            this.trancheHoraireResize.push(texte);
                            this.actualTask.duration = this.durationInit + (this.trancheHoraireResize.length - 1) * unitTime;
                            // Sinon si tranche precedemment rencontree on la retire
                        } else if (texte === this.trancheHoraireResize[i - 2]) {
                            this.trancheHoraireResize.pop();
                            this.actualTask.duration = this.durationInit + (this.trancheHoraireResize.length - 1) * unitTime;
                        }
                    }
                }
            },

            stopResize() {
                console.log("-----------------------");
                console.log("End resize");
                console.log("-----------------------");

                // On retire nos evenements de resizer
                window.removeEventListener('mousemove', this.resize, false);
                window.removeEventListener('mouseup', this.stopResize, false);

                // On reinitialise nos data
                this.actualDiv.draggable = true;
                this.actualDiv = null;
                this.actualTask = null;
                this.durationInit = 0;
            },

            // On recupere nos heure de debut et de fin d'une tache dans un jour (enfonction d'un parametre str)
            getSlotTime(task, p) {
                switch (p) {
                    case "start":
                        return task.startDate.format('HH:mm');
                    case "end":
                        return task.startDate.clone().add(task.duration, 'hours').format('HH:mm');
                    default:
                        return task.startDate.format('HH:mm') + "--" + task.startDate.clone().add(task.duration, 'hours').format('HH:mm');
                }
            },
            // On recupere le delai en jour pour la class : couleur en fonction du delai
            getDelai(date1, date2) {
                let delai = moment(date1).diff(moment(date2));
                delai = Math.floor(delai / (1000 * 60 * 60 * 24));
                if (delai > 0) {
                    switch (delai) {
                        case 0:
                        case 1: {
                            return "redDelay";
                        }
                        case 2: {
                            return "orangeDelay";
                        }
                        default : {
                            return "greenDelay"
                        }
                    }
                } else {
                    return "redDelay";
                }
            },

            // On teste le resize vers le haut en comparant les tranches heures
            negativResize(a, b, x, y) {
                // heure survolee : 08h30 (a,b) = (8,30)
                // heure init : 10h00 (x,y) = (10,0)
                if (a > x) {
                    return true
                } else if (a = x && b > y) {
                    return true
                } else {
                    return false
                }
                /*if (a > x) {
                    return true
                } else return !!(a = x && b > y);*/

                /*return (a > x || (a = x && b > y))*/
            },
            //___________________________________________________

            handleDrop(date, e) {
                console.log(e);
                // console.log('Caught in DayComponent', JSON.stringify(date))
                if (this.isDroppable()) {
                    const task = parseInt(e.dataTransfer.getData('task'), 10);
                    this.$emit('taskDropped', {taskId: task, date})
                }
            },

            isDroppable() {
                const day = this.mainDay.day();
                return day !== 0 && day !== 6;
            },

            unDroppable() {
                return this.isDroppable() ? 'other-day' : 'weekend'
            },

            today() {
                let dateCase = this.$props.mainDay.format("YYYY-MM-DD");
                let dateActu = moment().format("YYYY-MM-DD");
                return (dateCase === dateActu) ? 'today' : ''
            },

            testWeek() {
                return this.unDroppable() !== 'weekend';
            },

            startDrag(task, e) {
                e.dataTransfer.setData('task', task.id);
            },

            getUpperCase(type) {
                let word = [];
                word = (this.$props.mainDay.locale('fr').format(type)[0].toUpperCase()) + (this.$props.mainDay.locale('fr').format(type).substr(1));
                return word;
            },
        },

        created() {
            for (let i = startHour; i < endHour + 1; i++) {
                this.hours.push({
                    hour: i,
                    date: this.mainDay.clone().hours(i).minutes(0),
                    tasks: [],
                });
                this.hours.push({
                    hour: i,
                    date: this.mainDay.clone().hours(i).minutes(30),
                    tasks: [],
                })
            }
        },
    }
</script>
