<template>
  <div>
    <!----------------------------------------------------Bouton de gestion du calendrier------------------------------------------------>
    <div class="buttons">
      <button class="button" @click="changeDay('PrevWeek')">&lt;&lt;</button>

      <button class="button" @click="changeDay('Prev')">&lt;</button>
      <button class="button" @click="changeDay('Today')">Auj!</button>

      <button class="button" @click="changeDay('Next')">&gt;</button>
      <button class="button" @click="changeDay('NextWeek')">&gt;&gt;</button>
    </div>
    <!------------------------------------------------------Template de notre application------------------------------------------------>
    <div class="app">

      <week-component :mainDate="mainDate" @taskDropped="taskDropped" :tasks="tasks"/>
      <div class="tasks-list">
        <div class="tasks-list-year">{{mainDate.locale('fr').format('YYYY')}}</div>
        <div class="tasks-list-title">Panier de tâches</div>

        <div class="task"
             v-for="t in tasks"
             :key="t.id"
             v-show="!t.startDate"
             draggable="true"
             @dragstart="startDrag(t, $event)"><!--génération des tâches dans le panier-->
          {{t.label}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import WeekComponent from './components/WeekComponent'
  import data from './fake-tasks'
  import moment from 'moment'

  export default {
    name: 'app',
    components: {
      WeekComponent, /*composant enfant*/
    },
    data() {
      return {
        tasks: data.tasks,
        mainDate: moment().startOf('day'),
      }
    },
    methods: {
      startDrag(task, e) { /*prend un objet task et un event, sert à drag notre objet et transféré les données*/
        e.dataTransfer.setData('task', task.id)
      },
      taskDropped({taskId, date}) { /* prend un taskID et une date, sert à initialiser la date de commencement de la tâche */
        // console.log('Caught in App.vue:', taskId, date.format())
        for (let i = 0; i < this.tasks.length; i++) {
          if (this.tasks[i].id === taskId) {
            this.tasks[i].startDate = date;
            // console.log(this.tasks[i].label)
            break
          }
        }
      },
      changeDay(value) { /* Gestion defilement calendrier */
        const md = this.mainDate.clone();
        switch (value) {
          case 'Prev': {
            this.mainDate = md.subtract(1, 'day');
            break
          }
          case 'PrevWeek': {
            this.mainDate = md.subtract(7, 'day');
            break
          }
          case 'Next': {
            this.mainDate = md.add(1, 'day');
            break
          }
          case 'NextWeek': {
            this.mainDate = md.add(7, 'day');
            break
          }
          default: {
            this.mainDate = moment();
            break
          }
        }
      },
    },
  }
</script>

<style lang="scss">
  @import "stylesheets/style";
</style>
