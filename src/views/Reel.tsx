import Nav from "../parts/Nav";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { createTheme, ThemeProvider } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";

function Highlight(props: PickersDayProps<Dayjs> & { highlightedDays?: string[] }) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  const isSelected = !props.outsideCurrentMonth && highlightedDays.includes(day.format('YYYY-MM-DD'));
  return (
    <span className={isSelected ? "selected" : ""}>
      <PickersDay day={day} selected={isSelected} outsideCurrentMonth={outsideCurrentMonth} {...other} />
    </span>
  );
}

export default function NewReel(){
    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });
      const highlightedDays = ["2024-08-22"]
      
    return <>
        <Nav path={"/new/reel"} />
        <ThemeProvider
         theme={darkTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar onChange={(value) => { alert(value)}}
            defaultValue={dayjs()}
            disableFuture={true}
            sx={ { '.MuiPickersDay-today': {background: 'black', border: 'none !important' }}}  slots={{
              day: Highlight,
              }}
              slotProps={{
              day: {
                highlightedDays,
              } as any,
            }}/>
        </LocalizationProvider>
          </ThemeProvider>
    </>;
}
