import React, { useReducer, useContext } from 'react'
import axios from 'axios'
import ContactContext from './contactContext'
import contactReducer from './contactReducer'
import AlertContext from '../alert/alertContext'
import {
    GET_CONTACTS,
    ADD_CONTACT,
    DELETE_CONTACT,
    SET_CURRENT,
    CLEAR_CURRENT,
    UPDATE_CONTACT,
    FILTER_CONTACTS,
    CLEAR_CONTACTS,
    CLEAR_FILTER,
    CONTACT_ERROR
} from '../types'

const ContactState = props => {
    const initialState = {
        contacts: null,
        current: null,
        filtered: null,
        error:null,
        loading:true
    }

    const alertContext = useContext(AlertContext)
    const { setAlert } = alertContext

    const [ state,dispatch ] = useReducer(contactReducer,initialState)

    //Get contacts
    const getContacts = async () => {

        try {
            const res = await axios.get('/api/contacts')
            
            dispatch({ type:GET_CONTACTS, payload:res.data })
        } catch (err) {
            dispatch({ type: CONTACT_ERROR, payload:err.response.msg })
        }
    }
    
    //Add contact
    const addContact = async contact => {
        const config = {
            headers: {
                'Content-Type':'application/json'
            }
        }

        try {
            const res = await axios.post('/api/contacts',contact,config)
            
            dispatch({ type:ADD_CONTACT, payload:res.data })
        } catch (err) {
            dispatch({ type: CONTACT_ERROR, payload:err.response.msg })
        }
    }
    
    //Delete contact
    const deleteContact = async id => {
        try {
            const res = await axios.delete(`/api/contacts/${id}`)

            dispatch({ type:DELETE_CONTACT, payload:id })   
            setTimeout(() => setAlert(res.data.msg,'danger',2000) , 500)
        } catch (err) {
            dispatch({ type: CONTACT_ERROR, payload:err.response.msg })
        }
    }
    
    //Update contact
    const updateContact = async contact => {
        const config = {
            headers: {
                'Content-Type':'application/json'
            }
        }
        try {
            const res = await axios.put(`/api/contacts/${contact._id}`, contact, config)

            dispatch({ type:UPDATE_CONTACT, payload:res.data })
            setTimeout(() => setAlert('Contact Updated','success',2000) , 500)
        } catch (err) {
            dispatch({ type: CONTACT_ERROR, payload:err.response.msg })
        }
    }

    //Clear contacts
    const clearContacts = () => dispatch({ type:CLEAR_CONTACTS })

    //Set current contact
    const setCurrent = contact => {
        dispatch({ type:SET_CURRENT, payload:contact })
    }
    //Clear current contact
    const clearCurrent = () => {
        dispatch({ type:CLEAR_CURRENT })
    }

    
    //Filter contacts
    const filterContacts = text => {
        dispatch({ type:FILTER_CONTACTS, payload:text })
    }
    
    //Clear Filter
    const clearFilter = () => {
        dispatch({ type:CLEAR_FILTER })
    }

    return (
        <ContactContext.Provider
            value={{
                contacts:state.contacts,
                current:state.current,
                filtered:state.filtered,
                error:state.error,
                loading:state.loading,
                getContacts,
                addContact,
                deleteContact,
                clearCurrent,
                setCurrent,
                updateContact,
                filterContacts,
                clearFilter,
                clearContacts
            }}>
                {props.children}
        </ContactContext.Provider>
    )
}

export default ContactState