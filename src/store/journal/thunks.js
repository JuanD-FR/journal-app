import { collection, deleteDoc, doc, setDoc } from "firebase/firestore/lite";
import { firebaseDB } from "../../firebase/config";
import { addNEwEmptyNote, deleteNoteById, savingNewNote, setActiveNote, setNotes, setPhotosToActivenote, setSaving, updateNote } from "./journalSlice";
import { fileUpload, loadNotes } from "../../helpers";

export const startNewNote = () => {
    return async( dispatch, getState ) => {

        dispatch( savingNewNote() );

        const { uid } = getState().auth;
        const newNote = {
            title: '',
            body: '',
            date: new Date().getTime(),
        }

        const newDoc = doc( collection( firebaseDB, `${ uid }/journal/notes` ) );
        await setDoc( newDoc, newNote );
      
        newNote.id = newDoc.id;

        dispatch( addNEwEmptyNote( newNote ) );
        dispatch( setActiveNote( newNote ) );
    }
}

export const startLoadingNotes = () => {
    return async( dispatch, getState ) => {
        const { uid } = getState().auth;
        if (!uid) throw new Error('UID de usuario no existe');
        
        const notes = await loadNotes( uid );
        dispatch( setNotes( notes ) );
    }
}

export const startSaveNote = () => {
    return async( dispatch, getState ) => {

        dispatch( setSaving() );

        const { uid } = getState().auth;
        const { active:note } = getState().journal;
        const noteToFireStore = { ...note };
        delete noteToFireStore.id;
        
        const docRef = doc( firebaseDB, `${ uid }/journal/notes/${ note.id }` );
        await setDoc( docRef, noteToFireStore, { merge: true });

        dispatch( updateNote( note ) );
    }
}

export const startUploadingFiles = ( files = [] ) => {
    return async( dispatch ) => {
        dispatch( setSaving() );

        const fileUploadPromises = [];
        for (const file of files) {
            fileUploadPromises.push( fileUpload( file ) )
        }

        const photoUrls = await Promise.all( fileUploadPromises );
        
        dispatch( setPhotosToActivenote( photoUrls ) );
    }
}

export const startDeletingNote = ( files = [] ) => {
    return async( dispatch, getState ) => {
        const { uid } = getState().auth;
        const { active:note } = getState().journal;

        const docRef = doc( firebaseDB, `${ uid }/journal/notes/${ note.id }` );
        await deleteDoc( docRef );

        dispatch( deleteNoteById( note.id ))
    }
}