import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { createTheme, ThemeProvider } from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Highlight(props: PickersDayProps<Dayjs> & { existDays?: string[] }) {
  const { existDays = [], day, outsideCurrentMonth, ...other } = props;
  const isSelected = !props.outsideCurrentMonth && existDays.includes(day.format('YYYY-MM-DD'));
  return (
    <span className={isSelected ? "selected" : ""}>
      <PickersDay day={day} selected={isSelected} outsideCurrentMonth={outsideCurrentMonth} {...other} />
    </span>
  );
}

export default function KineSelector(){
  const navigate = useNavigate()
    const [existDays, setExistDays] = useState([])
    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });
      //const existDays = ["2024-08-22"]
      useEffect(() => {
        async function loadKines() {
          const resp = await fetch('/api/kines');
          if (!resp.ok) {
            console.log(resp.statusText)
            return
          }
          setExistDays(await resp.json())
        }
        loadKines();
      }, [])

      async function createKine(value: Dayjs) {
        console.log();
        const resp = await fetch('/api/kine/create', {
          method: "POST",
          body: value.format("YYYY-MM-DD"),
        })
        if (!resp.ok) {
          console.log(resp)
          alert(resp.statusText)
          return
        }
        navigate(await resp.text())
      }
      
    return <>
        <ThemeProvider
         theme={darkTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar onChange={createKine}
            disableFuture={true}
            sx={ { '.MuiPickersDay-today': {background: 'black', border: 'none !important' }}}  slots={{
              day: Highlight,
              }}
              slotProps={{
              day: {
                existDays,
              } as any,
            }}/>
        </LocalizationProvider>
          </ThemeProvider>
    </>;
}
