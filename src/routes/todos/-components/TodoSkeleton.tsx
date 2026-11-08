import { Card, CardActions, CardContent, CardHeader, Container, Skeleton } from "@mui/material";

export const TodoSkeleton = () => (
  <Container maxWidth="md" sx={{ my: 2 }}>
    <Card>
      <CardHeader title={<Skeleton width={120} />} />
      <CardContent>
        <Skeleton width={420} height={56} />
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Skeleton variant="rounded" width={180} height={36} />
      </CardActions>
    </Card>
  </Container>
);
