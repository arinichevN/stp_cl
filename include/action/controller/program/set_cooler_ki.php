<?php

namespace controller\program;

class set_cooler_ki {

    public static function getUser() {
        return ['stranger' => '*'];
    }

    public static function execute($p) {
        \sock\init($p['address'], $p['port']);
        \acp\requestSendI1F1List(ACP_CMD_REGSMP_PROG_SET_COOLER_KI, $p['item']);
        \sock\suspend();
    }

}
