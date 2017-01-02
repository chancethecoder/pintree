
import mysql from 'promise-mysql'
import { DB_CONFIG } from './secret'


const QUERY = {
    GET_USER: `
        SELECT USER_ID id, USER_NAME name, USER_TOKKEN tokken, USER_DT dt
        FROM USER
        WHERE USER_ID = ?
    `,

    GET_PADS: `
        SELECT PAD_ID id, PAD_NAME name, PAD_STATE state, PAD_DT dt
        FROM PAD
        WHERE USER_ID = ?
    `,
    UPDATE_PAD: `
        UPDATE PAD
        SET PAD_STATE = ?
        WHERE PAD_ID = ?
    `,
    DELETE_PAD: `
        DELETE FROM PAD
        WHERE PAD_ID = ?
    `,

    GET_REVISIONS: `
        SELECT REVISION_ID id, REVISION_CONTENT content, REVISION_DT dt
        FROM REVISION
        WHERE PAD_ID = ?
        ORDER BY id DESC
    `,
    ADD_REVISION: `
        INSERT INTO REVISION (PAD_ID, REVISION_CONTENT, REVISION_DT)
        VALUES (?, ?, NOW())
    `,
    CLEAR_REVISIONS: `
        DELETE FROM REVISION
        WHERE PAD_ID = ?
    `,
}


/**
 * 유저의 모든 정보를 읽어온다
 * @param  {String} userId
 * @return {Promise} user
 */
function getUser( userId ){
    const user = {
        info: {},
        pads: []
    }
    let connection = {}

    return mysql.createConnection(DB_CONFIG)
    .then( conn => {
        connection = conn
        return connection.query(QUERY.GET_USER, [userId])
    })
    .then( users => {
        user.info = users[0]
        return connection.query(QUERY.GET_PADS, [userId])
    })
    .then( pads => {
        user.pads = pads.map( pad => {
            pad.state = JSON.parse(pad.state)
            return pad
        })
        const reqs = pads.map( pad => connection.query(QUERY.GET_REVISIONS, [pad.id]) )
        return Promise.all(reqs)
    })
    .then( revs => {
        for(let i in revs){
            revs[i] = revs[i].map( rev => {
                // fix json format
                rev.content = JSON.parse(rev.content.replace(/\\n/g, '\\n'))
                return rev
            })
            user.pads[i].revisions = revs[i]
        }
        return user
    })
}


/**
 * 새로운 리비전을 추가한다
 * @param  {String} padId
 * @param  {String} content
 * @return {Promise}
 */
function savePad( padId, content ){
    let connection = {}

    return mysql.createConnection(DB_CONFIG)
    .then( conn => {
        connection = conn
        return connection.query(QUERY.ADD_REVISION, [padId, JSON.stringify(content)])
    })
}


/**
 * 윈도우 정보를 저장한다
 * @param  {String} padId
 * @param  {String} state
 * @return {Promise}
 */
function saveWindow( padId, state ){
    let connection = {}

    return mysql.createConnection(DB_CONFIG)
    .then( conn => {
        connection = conn
        return connection.query(QUERY.UPDATE_PAD, [JSON.stringify(state), padId])
    })
}


/**
 * 패드를 삭제한다
 * @param  {String} padId
 * @return {Promise}
 */
function removePad( padId, state ){
    let connection = {}

    return mysql.createConnection(DB_CONFIG)
    .then( conn => {
        connection = conn
        return connection.query(QUERY.CLEAR_REVISIONS, [padId])
    })
    .then( result => connection.query(QUERY.DELETE_PAD, [padId]) )
}


export default {
  getUser,
  savePad,
  saveWindow,
  removePad
}
