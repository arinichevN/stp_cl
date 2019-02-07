<?php

$af = function($p) {
	\sock\init($p['address'], $p['port']);
	\acp\requestSendI1List(ACP_CMD_PROG_NEXT_STEP, $p['item']);
	\sock\suspend();
};
