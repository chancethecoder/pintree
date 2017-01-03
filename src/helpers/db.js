
import mysql from 'promise-mysql'
import { DB_CONFIG } from './secret'
import fs from 'fs'

const sqlite = require('sqlite3').verbose()
const db = new sqlite.Database('./database_multipad.db')

const userId = 'test'


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
    ADD_PAD: `
        INSERT INTO PAD (USER_ID, PAD_NAME, PAD_STATE, PAD_DT)
        VALUES (?, ?, ?, datetime('now'))
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
        SELECT REVISION_ID id, PAD_ID, REVISION_CONTENT content, REVISION_DT dt
        FROM REVISION
        WHERE PAD_ID = ?
        ORDER BY id DESC
    `,
    ADD_REVISION: `
        INSERT INTO REVISION (PAD_ID, REVISION_CONTENT, REVISION_DT)
        VALUES (?, ?, datetime('now'))
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
        info: {
            id: userId
        },
        pads: []
    }

    const getPads = function( userId ){
        return new Promise((resolve, reject) => {
            db.all(QUERY.GET_PADS, [userId], (err, pads) => {
                //console.log(pads)
                if(err) reject(err)
                else resolve(pads)
            })
        })
    }

    const getRevisions = function( pads ){
        user.pads = pads.map( pad => {
            pad.state = JSON.parse(pad.state)
            return pad
        })
        const reqs = pads.map( pad => new Promise((resolve, reject) => {
            db.all(QUERY.GET_REVISIONS, [pad.id], (err, revs) => {
                // console.log(revs);
                if(err) reject(err)
                else resolve(revs)
            })
        }))
        return Promise.all(reqs)
    }

    return getPads( userId )
    .then( pads => getRevisions(pads) )
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
 * 패드를 생성한다
 * @param  {String} user
 * @param  {String} padName
 * @param  {String} state
 * @return {Promise}
 */
function createPad( user, padName, state ){
    let connection = {}

    return new Promise((resolve, reject) => {
        db.run(QUERY.ADD_PAD, [user, padName, JSON.stringify(state)], (err, result) => {
            if(err) reject(err)
            else {
                db.get(QUERY.GET_PADS, [userId], (err, rev) => {
                    resolve({
                        insertId: rev.id
                    })
                })
            }
        })
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

    return new Promise((resolve, reject) => {
        db.run(QUERY.ADD_REVISION, [padId, JSON.stringify(content)], (err, result) => {
            if(err) reject(err)
            else resolve(result)
        })
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

    return new Promise((resolve, reject) => {
        db.run(QUERY.UPDATE_PAD, [JSON.stringify(state), padId], (err, result) => {
            if(err) reject(err)
            else resolve(result)
        })
    })
}


/**
 * 패드를 삭제한다
 * @param  {String} padId
 * @return {Promise}
 */
function removePad( padId, state ){
    let connection = {}

    const clearRevisions = function( padId ){
        return new Promise((resolve, reject) => {
            db.run(QUERY.CLEAR_REVISIONS, [padId], (err, result) => {
                if(err) reject(err)
                else resolve(result)
            })
        })
    }

    return clearRevisions(padId)
    .then(()=>{
        db.run(QUERY.DELETE_PAD, [padId], (err, result) => {
            if(err) Promise.reject(err)
            else Promise.resolve(result)
        })
    })
}


export default {
  getUser,
  savePad,
  saveWindow,
  removePad,
  createPad
}
