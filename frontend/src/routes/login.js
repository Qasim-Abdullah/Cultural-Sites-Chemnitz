import { VStack, Button, FormControl, FormLabel, Input,Text } from "@chakra-ui/react"
import { useState } from "react"
import { useAuth } from "../context/useAuth"
import { useNavigate } from "react-router-dom"

const Login = () => {
    const [username,setUsername]=useState('')
    const [password,setPassword]=useState('')
    const nav = useNavigate()
    const {login_user}=useAuth();
    const handleNav=()=>{ 
        nav('/register')
    }
    const handleLogin=()=>{
        login_user(username,password)

    }
    return (
        <VStack>
            <FormControl>
                <FormLabel>USERNAME</FormLabel>
                <Input onChange={(e)=>setUsername(e.target.value)} value={username} type='text' />
            </FormControl>
            <FormControl>
                <FormLabel>PASSWORD</FormLabel>
                <Input onChange={(e)=>setPassword(e.target.value)} value={password} type='password' />
            </FormControl>
            <Button onClick={handleLogin} > Login</Button>
            <Text onClick={handleNav}>Dont have account</Text>

        </VStack>
    )


}

export default Login