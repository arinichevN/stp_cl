<?php

namespace controller\program;

class enable {

    public static function getUser() {
        return ['stranger' => '*'];
    }

    public static function execute($p) {
        \sock\init($p['address'], $p['port']);
        \acp\requestSendI1List(ACP_CMD_PROG_ENABLE, $p['item']);
        \sock\suspend();
    }

}
