import { VStack, Heading,Text, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { get_notes,logout } from "./endpoints/api";
import { useNavigate } from "react-router-dom";
import LocationMapApp from "../components/location_map";
import InteractiveMap from "../components/map";

const Menu = () => {
    const [notes, setNotes] = useState([])
    const nav = useNavigate();
    useEffect(() => {
        const fetchNotes= async()=>{
            const notes= await get_notes()
            setNotes(notes)
        }
        fetchNotes();

    },[])

    const handleLogout =async()=>{
        const success =  await logout();
        if(success){
            nav('/login')
        }
    }
    return (
        <>
        <VStack>
            <Heading>
                Welcome
            </Heading>
            <VStack>
                {notes.map((note)=>{
                    return <Text>{note.description}</Text>
                })}
            </VStack>
            
            <Button onClick={handleLogout}>Logout</Button>
        </VStack>
        <LocationMapApp/>
        
        </>

    )

}

export default Menu;