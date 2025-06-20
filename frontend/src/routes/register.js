import { VStack, Button, FormControl, FormLabel, Input, } from "@chakra-ui/react"
import { useState } from "react"
import { useAuth } from "../context/useAuth"
import { useNavigate } from "react-router-dom"

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [confirm_password, setconfrimPassword] = useState('')
    const [password, setPassword] = useState('')
    
    const { register_user } = useAuth();
    
    const handleRegister = () => {
        register_user(username,email, password,confirm_password)

    }
    return (
        <VStack>
            <FormControl>
                <FormLabel>USERNAME</FormLabel>
                <Input onChange={(e) => setUsername(e.target.value)} value={username} type='text' />
            </FormControl>
            <FormControl>
                <FormLabel>Email</FormLabel>
                <Input onChange={(e) => setEmail(e.target.value)} value={email} type='text' />
            </FormControl>
            <FormControl>
                <FormLabel>Password</FormLabel>
                <Input onChange={(e) => setPassword(e.target.value)} value={password} type='password' />
            </FormControl>

            <FormControl>
                <FormLabel>Confirm PASSWORD</FormLabel>
                <Input onChange={(e) => setconfrimPassword(e.target.value)} value={confirm_password} type='password' />
            </FormControl>
            <Button onClick={handleRegister} > Login</Button>
            

        </VStack>
    )


}

export default Register;