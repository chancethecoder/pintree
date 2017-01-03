
-- user

INSERT INTO USER (USER_ID, USER_NAME, USER_TOKKEN, USER_DT)
VALUES ('test', '테스트', '', date('now'));

-- pad

INSERT INTO PAD (USER_ID, PAD_NAME, PAD_STATE, PAD_DT)
VALUES ('test', 'noname', '{"width":400,"height":321,"frame":false,"backgroundColor":"#fff","x":1471,"y":247}', date('now'));

-- revisions

INSERT INTO REVISION (PAD_ID, REVISION_CONTENT, REVISION_DT)
VALUES (1, '{"ops":[{"insert":"hello world\n"}]}', date('now'));
