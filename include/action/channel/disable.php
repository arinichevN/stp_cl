<?php

$af = function($p) {
	\sock\init($p['address'], $p['port']);
	\acp\requestSendI1List(ACP_CMD_CHANNEL_DISABLE, $p['item']);
	\sock\suspend();
};
