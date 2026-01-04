import { action, makeObservable, observable } from 'mobx'
import moment from 'moment'

export class VideoModel {
  duration
  id
  channelId
  published = null
  description
  order
  thumb
  title

  constructor (props) {
    makeObservable(this, {
      duration: observable,
      id: observable,
      channelId: observable,
      published: observable.ref,
      description: observable,
      order: observable,
      thumb: observable,
      title: observable,
      update: action,
    })

    this.duration = props.duration
    this.id = props.id
    this.channelId = props.channelId
    this.published = moment(props.published)
    this.description = props.description
    this.order = props.order
    this.thumb = props.thumb
    this.title = props.title
  }

  update ({ order }) {
    this.order = order
  }
}
