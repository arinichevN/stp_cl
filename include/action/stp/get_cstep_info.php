<?php

$af = function($p) {
	\sock\init($p['address'], $p['port']);
	$id=\acp\requestSendI1List(ACP_CMD_CHANNEL_GET_DATA_RUNTIME, $p['item']);
	$data = \acp\getRegsmpDataRuntime($id);
	\sock\suspend();
	return $data;
};
