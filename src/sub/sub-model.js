import _ from 'lodash'
import { action, computed, observable } from 'mobx'

class SubModel {
  @observable author
  @observable icon
  @observable id
  @observable isCustom
  @observable order
  @observable playlistId
  @observable thumb
  @observable title
  @observable markedVideoId
  @observable videos = observable.map()

  @computed get videoIds () {
    return this.videos.keys()
  }

  constructor (props) {
    this.author = props.author
    this.icon = props.icon
    this.id = props.id
    this.isCustom = props.isCustom || props.custom
    this.order = props.order
    this.playlistId = props.playlistId
    this.thumb = props.thumb
    this.title = props.title
    this.markedVideoId = props.markedVideoId
    this.videos = observable.map(props.videos)
  }

  @action update (props) {
    _.extend(this, props)
  }

  addVideo (video) {
    this.videos.set(video.id, video)
  }

  removeVideo (videoId) {
    this.videos.delete(videoId)
  }
}

export default SubModel
