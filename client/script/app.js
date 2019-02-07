var app = {
    LIMIT: {
        GET_DATA: 3
    },
    NAME_SIZE: 32,
    controller_state: null,
    version: 1,
    controller_version: null,
    MODE:{
      RETURN:{
          PID:'PID',
          ONF:'ONF'
      },
      DB:{
          PID:'pid',
          ONF:'onf'
      }  
    },
    version_acceptable: {
        controller: [1],
        f_php: [2],
        f_js: [2]
    },
    init: function () {
        trans.setLang(1, ["english", "русский"]);
    },
    update: function () {
        this.sendU();
    }
};
elem.push(app);
