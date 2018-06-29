import moment from 'moment'

let ids = 0;

const taskGen = () => ({
  id: ids++,
  label: `T${ids}`,
  duration: .5,
  dueDate: moment().endOf('week'),
  startDate: null,
  project_id: Math.round(Math.random()) + 1,
  range: [],
});

export default {
  projects: [
    {id: 1, name: 'Un super projet'},
    {id: 2, name: 'Un moyen bon projet'},
  ],
  tasks: [
    taskGen(),
    taskGen(),
    taskGen(),
    taskGen(),
    taskGen(),
    taskGen(),
    taskGen(),
    taskGen(),
    taskGen(),


  ],

}

