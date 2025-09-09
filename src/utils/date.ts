import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import "dayjs/locale/zh-cn"

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("zh-cn")

export const formatDate = (date: string | Date, format = "YYYY-MM-DD HH:mm:ss") => {
  return dayjs(date).format(format)
}

export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow()
}

export const formatToday = () => {
  return dayjs().format("YYYY-MM-DD")
}

export const formatNow = () => {
  return dayjs().format("YYYY-MM-DD HH:mm:ss")
}

export { dayjs }
