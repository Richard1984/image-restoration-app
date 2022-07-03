import axios from 'axios';
import { createRef, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../../components/Button/Button';
import styles from './home.module.scss';

interface HomeProps {

}

const Home = (props: HomeProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [size, setSize] = useState(20)
    const [color, setColor] = useState("black")
    const [resultImage, setResultImage] = useState<string>("")
    const [file, setFile] = useState<File | null>(null)
    const fileInput = createRef<HTMLInputElement>();
    const [isDrawing, setIsDrawing] = useState(false)

    const handleChangeSize = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSize(Number(e.target.value))
    }

    const handleChangeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value)
    }

    const handleClearCanvas = () => {
        const canvasElement = canvasRef.current
        const context = canvasElement!.getContext("2d");

        context!.clearRect(0, 0, canvasElement!.width, canvasElement!.height)
    }

    const fileToDataUri = (field: Blob): Promise<string | ArrayBuffer | null> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                resolve(reader.result);
            });
            reader.readAsDataURL(field);
        });
    }

    const selectFiles = () => {
        fileInput!.current!.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {

        if (!e.target.files) {
            return;
        }

        const image = document.createElement("img") as HTMLImageElement;
        const file = e.target.files![0];

        setFile(file)


        const uri = await fileToDataUri(file)

        if (uri) {
            image.src = uri as string;
        }

        image.addEventListener("load", () => {
            drawOnImage(image);
        });
    }

    const handleRestore = async () => {
        const loadingToast = toast.loading("Restoring...")

        const canvasElement = canvasRef.current

        const dataUrl = canvasElement!.toDataURL('image/png')

        const fileToUpload = dataURLtoFile(dataUrl, file!.name)

        const formData = new FormData();
        formData.append('file', fileToUpload)

        try {
            const response = await axios.post('http://localhost:5000/restore', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                responseType: 'blob'
            })
            setResultImage(URL.createObjectURL(response.data))
            toast.update(loadingToast, { render: "Image restored!", type: 'success', isLoading: false, autoClose: 5000 })
        } catch (e) {
            toast.update(loadingToast, { render: "An error occurred during the restore process!", type: 'error', isLoading: false, autoClose: 5000 })
        }
    }

    const dataURLtoFile = (dataUrl: string, fileName: string) => {
        let arr = dataUrl.split(',')
        let mime = arr[0].match(/:(.*?);/)![1]
        let bstr = window.atob(arr[1])
        let n = bstr.length
        let u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);

        }
        return new File([u8arr], fileName, { type: mime });
    }

    const drawOnImage = (image: HTMLImageElement | null = null) => {
        const canvasElement = canvasRef.current
        const context = canvasElement!.getContext("2d");

        // if an image is present,
        // the image passed as a parameter is drawn in the canvas
        if (image) {
            context!.drawImage(image, 0, 0, canvasElement!.offsetWidth, canvasElement!.offsetHeight);
        }
    }

    const handleOnCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const canvasElement = canvasRef.current
        const context = canvasElement!.getContext("2d");
        setIsDrawing(true)
        context!.beginPath();
        context!.lineWidth = size;
        context!.strokeStyle = color;
        context!.lineJoin = "round";
        context!.lineCap = "round";
        context!.moveTo(e.clientX - canvasElement!.offsetLeft, e.clientY - canvasElement!.offsetTop);
    }

    const handleOnMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const canvasElement = e.nativeEvent.target as HTMLCanvasElement
        const context = canvasElement!.getContext("2d");
        if (isDrawing) {
            context!.lineTo(e.clientX - canvasElement!.offsetLeft, e.clientY - canvasElement!.offsetTop);
            context!.stroke();
        }
    }

    const handleOnMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const canvasElement = e.nativeEvent.target as HTMLCanvasElement
        const context = canvasElement!.getContext("2d");
        setIsDrawing(false)
        context!.closePath();
    }

    useEffect(() => {

        const canvasElement = canvasRef.current

        if (canvasElement) {
            canvasElement.width = canvasElement?.parentElement?.clientWidth || 0
            canvasElement.height = canvasElement?.parentElement?.clientWidth || 0
        }

        // enabling drawing on the blank canvas
        drawOnImage();
    }, [])


    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <canvas
                    className={styles.canvas}
                    width="500"
                    height="500"
                    ref={canvasRef}
                    onMouseDown={handleOnCanvasMouseDown}
                    onMouseMove={handleOnMouseMove}
                    onMouseUp={handleOnMouseUp}
                ></canvas>

                <div className={styles.result}>
                    {resultImage ? <img src={resultImage} alt="Result" /> : null}
                </div>
            </div>
            <div className={styles.controls}>
                <div className={styles.content}>
                    <div>
                        <h2 className={styles.title}>Settings</h2>

                        <p>
                            Start drawing on the blank canvas or upload an image and use the brush to
                            modify on it.
                        </p>
                    </div>
                    <div style={{ marginTop: "5px" }}>
                        <span>Size: </span>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={size}
                            className="size"
                            id="sizeRange"
                            onChange={handleChangeSize}
                        />
                    </div>

                    <div style={{ marginTop: "5px" }}>
                        <span>Color: </span>
                        <input type="radio" name="colorRadio" id="black" value="black" checked={color === "black"} onChange={handleChangeColor} />
                        <label htmlFor="black">Black</label>
                        <input type="radio" name="colorRadio" id="white" value="white" checked={color === "white"} onChange={handleChangeColor} />
                        <label htmlFor="white">White</label>
                        <input type="radio" name="colorRadio" id="red" value="red" checked={color === "red"} onChange={handleChangeColor} />
                        <label htmlFor="red">Red</label>
                        <input type="radio" name="colorRadio" id="green" value="green" checked={color === "green"} onChange={handleChangeColor} />
                        <label htmlFor="green">Green</label>
                        <input type="radio" name="colorRadio" id="blue" value="blue" checked={color === "blue"} onChange={handleChangeColor} />
                        <label htmlFor="blue">Blue</label>
                    </div>
                    <div style={{ marginTop: "15px" }}>
                        <input
                            id="upload" type="file" accept="image/*"
                            ref={fileInput}
                            name="file"
                            hidden
                            onChange={handleFileSelect}
                        />
                        <Button onClick={() => selectFiles()} text="Upload image to restore" componentProps={{ style: { display: "inline-block", marginRight: "15px" } }} />

                        {file?.name ? <p style={{ display: "inline-block" }}>Selected file: {file?.name}</p> : null}
                    </div>
                    <div style={{ marginTop: "15px" }}>
                        <Button onClick={() => handleClearCanvas()} text="Clear" componentProps={{ style: { marginRight: "15px" } }} />
                        <Button onClick={() => handleRestore()} text="Restore" />
                    </div>
                </div>
            </div>


        </div>
    );
}

export default Home