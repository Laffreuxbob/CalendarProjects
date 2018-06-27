<template>
    <div class="week">
        <day v-for="d in days"
             :main-day="d"
             :tasks="tasks"
             :key="d.format('YYYY-MM-DD')"
             @taskDropped="taskDropped"></day>
    </div>
</template>

<script>
import moment from 'moment'
import Day from './DayComponent'

export default {
  components: {Day},
  props: {
    tasks: {required: false, type: Array, default: () => ([])},
    mainDate: {required: false, type: Object, default: () => moment()},
  },
  computed: {
    startDay () {
      // console.log("week", this.$props.mainDate.format());
      return this.$props.mainDate

      // return this.$props.mainDate.subtract(3, 'days')
    },
    days () {
      const out = [];
      for (let i = 0; i < 7; i++) {
        out.push(this.startDay.clone().add(i-2, 'days'))
      }
      return out
    },
  },
  methods: {
    taskDropped (payload) {
      // console.log('Caught in WeekComponent.vue', payload)
      this.$emit('taskDropped', payload)
    },
  },
}
</script>
