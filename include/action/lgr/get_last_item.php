<?php

$af = function($p) {
	\sock\init($p['address'], $p['port']);
	\acp\requestSendI2List(ACP_CMD_LGR_CHANNEL_GET_LAST_ITEM, $p['item']);
	$data = \acp\getLgrItem($id);
	\sock\suspend();
	return $data;
};
