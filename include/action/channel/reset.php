<?php

$af = function($p) {
	\sock\init($p['address'], $p['port']);
	\acp\requestSendI1List(ACP_CMD_CHANNEL_RESET, $p['item']);
	\sock\suspend();
};
