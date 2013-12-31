App.ApplicationAdapter = DS.Adapter.extend

  findAll: (store, type)->
    App.ls.get(type).then (data)->
      (record for key, record of data.records)

  find: (store, type, id)->
    App.ls.get(type).then (data)->
      data.records[id]

  createRecord: (store, type, record)->
    @_saveRecord store, type, record

  updateRecord: (store, type, record)->
    @_saveRecord store, type, record

  deleteRecord: (store, type, record)->
    id = record.get 'id'
    App.ls.get(type).then (data)->
      delete data.records[id] if data.records?[id]?
      App.ls.set(type, data).then -> record

  _saveRecord: (store, type, record)->
    id = record.get 'id'
    App.ls.get(type).then (data)->
      data.records ||= {}
      savedRecord = type.serialize record
      data.records[id] = savedRecord
      App.ls.set(type, data).then -> savedRecord

# {
#     "sub": {
#         "records": {
#             "UCJTWU5K7kl9EE109HBeoldA": {
#                 "id": "UCJTWU5K7kl9EE109HBeoldA",
#                 "title": "Generikb",
#                 "author": "Generikb",
#                 "thumb": "https://lh6.googleusercontent.com/-YzwncYuIejo/AAAAAAAAAAI/AAAAAAAAAAA/lmWTWrVXTbA/photo.jpg",
#                 "videos": [],
#                 "default": true
#             },
#             "UCP6f9x4iXk3LH8Q1sqJmYPQ": {
#                 "id": "UCP6f9x4iXk3LH8Q1sqJmYPQ",
#                 "title": "paulsoaresjr",
#                 "author": "paulsoaresjr",
#                 "thumb": "https://lh5.googleusercontent.com/-lHQGaB6kiOg/AAAAAAAAAAI/AAAAAAAAAAA/W7sE98_H3o0/photo.jpg",
#                 "videos": [],
#                 "default": false
#             }
#         }
#     },
#     "singles": {},
#     "lists": {
#         "watched_videos_UCJTWU5K7kl9EE109HBeoldA": [
#             "F14KqWVTQ6E",
#             "Qr3MiKUtZ0c",
#             "7dH7_7ywGkc",
#             "BsOkMIa5ILE",
#             "6jFHV4Rjf20",
#             "opdHrl78Lec",
#             "iiRfMrb0Vno",
#             "F-65qj45Ov8",
#             "RI7tRjkdg6A",
#             "k2fUbzfBQf8",
#             "XugTuQuAA_o",
#             "7LvdbDrIvJU",
#             "Nhk2bbDLUrw",
#             "YFg__-LJaVk",
#             "Bg5pvCT5H3E",
#             "Ozb1n4LdwR4",
#             "oSPsprKQaDA",
#             "RgBc0jX9S7A",
#             "17k367y7xqk",
#             "CI9fL9Nlfh0",
#             "4OrUPkW7n3w",
#             "skYPyELYx00"
#],
#         "watched_videos_UCP6f9x4iXk3LH8Q1sqJmYPQ": [
#             "a84NKsIQG1c",
#             "q9DL36N4ta4",
#             "gsLZzAht9_0"
#]
#     }
# }
