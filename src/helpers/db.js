
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
    GET_REVISIONS: `
        SELECT REVISION_ID id, REVISION_CONTENT content, REVISION_DT dt
        FROM REVISION
        WHERE PAD_ID = ?
    `,
}


/**
 * 유저의 모든 정보를 읽어온다
 * @param  {String} id 아이디
 * @return {Promise} user
 */
function getUser( id ){
    const user = {
        info: {},
        pads: []
    }
    let connection = {}

    return mysql.createConnection(DB_CONFIG)
    .then( conn => {
        connection = conn
        return connection.query(QUERY.GET_USER, [id])
    })
    .then( users => {
        user.info = users[0]
        return connection.query(QUERY.GET_PADS, [id])
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

export default { getUser }
