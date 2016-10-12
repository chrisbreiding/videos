import _ from 'lodash'
import { computed, map, observable } from 'mobx'

class SubModel {
  @observable author
  @observable icon
  @observable id
  @observable isCustom
  @observable order
  @observable playlistId
  @observable thumb
  @observable title
  @observable videos = map()

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
    this.videos = map(props.videos)
  }

  update (props) {
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
